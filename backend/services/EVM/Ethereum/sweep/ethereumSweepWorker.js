const pool = require("../../../../config/db");
const {
  getPendingSweepJobs,
} = require("./sweepJobService");
const { ethers } = require("ethers");
const { getProvider } = require("../../../blockchainService");
const {
  getDepositWallet,
} = require("../../../walletService");

const provider = getProvider();

// ============================================================
// HOT WALLET
// ============================================================
const HOT_WALLET_PRIVATE_KEY =
  process.env.EVM_HOT_WALLET_PRIVATE_KEY;

if (!HOT_WALLET_PRIVATE_KEY) {
  throw new Error(
    "EVM_HOT_WALLET_PRIVATE_KEY is not configured"
  );
}

// Create Hot Wallet from its private key
const hotWallet = new ethers.Wallet(
  HOT_WALLET_PRIVATE_KEY,
  provider
);

// Hot Wallet address is automatically derived from the private key.
// No separate EVM_HOT_WALLET_ADDRESS variable is required.
const HOT_WALLET_ADDRESS = hotWallet.address;


const confirmations = Number(
  process.env.BLOCKCHAIN_CONFIRMATIONS || 3
);


const getTokenBalance = async ({
  tokenContract,
  walletAddress,
}) => {
  const token = new ethers.Contract(
    tokenContract,
    [
      "function balanceOf(address owner) view returns (uint256)",
    ],
    provider
  );

  return await token.balanceOf(walletAddress);
};

const getNativeBalance = async (walletAddress) => {
  return await provider.getBalance(walletAddress);
};

const validateSweepAddresses = ({
  sourceAddress,
  destinationAddress,
}) => {
  if (!ethers.isAddress(sourceAddress)) {
    throw new Error(
      `Invalid source address: ${sourceAddress}`
    );
  }

  if (!ethers.isAddress(destinationAddress)) {
    throw new Error(
      `Invalid destination address: ${destinationAddress}`
    );
  }

  if (
    sourceAddress.toLowerCase() ===
    destinationAddress.toLowerCase()
  ) {
    throw new Error(
      "Source address and hot wallet address cannot be the same"
    );
  }
};

const reconcileBroadcastSweepJobs = async () => {
  const result = await pool.query(
    `SELECT
       id,
       tx_hash,
       attempts
     FROM sweep_jobs
     WHERE status = 'broadcast'
       AND tx_hash IS NOT NULL
     ORDER BY updated_at ASC
     LIMIT 20`
  );

  if (result.rows.length === 0) {
    return;
  }

  const currentBlock =
    await provider.getBlockNumber();

  for (const job of result.rows) {
    try {
      const receipt =
        await provider.getTransactionReceipt(
          job.tx_hash
        );

      if (!receipt) {
        console.log(
          "SWEEP BROADCAST TX STILL PENDING:",
          {
            jobId: job.id,
            txHash: job.tx_hash,
          }
        );

        continue;
      }

      const txConfirmations =
        currentBlock -
        receipt.blockNumber +
        1;

      if (receipt.status !== 1) {
        await pool.query(
          `UPDATE sweep_jobs
           SET
             status = CASE
               WHEN attempts >= 10
                 THEN 'failed'
               ELSE 'queued'
             END,
             last_error = $1,
             next_attempt_at = CASE
               WHEN attempts >= 10
                 THEN NULL
               ELSE CURRENT_TIMESTAMP +
                    INTERVAL '5 minutes'
             END,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $2
             AND status = 'broadcast'`,
          [
            "Sweep transaction failed on blockchain",
            job.id,
          ]
        );

        console.log(
          "SWEEP BROADCAST TX FAILED:",
          {
            jobId: job.id,
            txHash: job.tx_hash,
          }
        );

        continue;
      }

      if (txConfirmations < confirmations) {
        continue;
      }

      await pool.query(
        `UPDATE sweep_jobs
         SET
           status = 'confirmed',
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP,
           last_error = NULL
         WHERE id = $1
           AND status = 'broadcast'`,
        [job.id]
      );

      console.log(
        "SWEEP BROADCAST TX RECONCILED:",
        {
          jobId: job.id,
          txHash: job.tx_hash,
          confirmations: txConfirmations,
        }
      );
    } catch (err) {
      console.error(
        "SWEEP BROADCAST RECONCILIATION ERROR:",
        {
          jobId: job.id,
          error: err,
        }
      );
    }
  }
};

const processEthereumSweepJobs = async () => {
  await reconcileBroadcastSweepJobs();

  const jobs = await getPendingSweepJobs(10);

  if (jobs.length === 0) {
    return;
  }

  for (const job of jobs) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const lockResult = await client.query(
        `UPDATE sweep_jobs
         SET
           status = 'processing',
           attempts = attempts + 1,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND status = 'queued'
           AND (
             next_attempt_at IS NULL
             OR next_attempt_at <= CURRENT_TIMESTAMP
           )
         RETURNING
           id,
           network,
           chain_id,
           asset,
           token_contract,
           deposit_address_id,
           source_address,
           destination_address,
           amount,
           status,
           attempts`,
        [job.id]
      );

      if (lockResult.rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        continue;
      }

      const lockedJob = lockResult.rows[0];

      await client.query("COMMIT");
      client.release();

      validateSweepAddresses({
        sourceAddress: lockedJob.source_address,
        destinationAddress:
          lockedJob.destination_address,
      });

      if (
        !lockedJob.token_contract
      ) {
        throw new Error(
          "Sweep token contract is missing"
        );
      }

      if (
        lockedJob.amount === null ||
        lockedJob.amount === undefined
      ) {
        throw new Error(
          "Sweep amount is missing"
        );
      }

      const sweepAmount =
        BigInt(lockedJob.amount);

      if (sweepAmount <= 0n) {
        throw new Error(
          "Invalid sweep amount"
        );
      }

      const tokenBalance =
        await getTokenBalance({
          tokenContract:
            lockedJob.token_contract,
          walletAddress:
            lockedJob.source_address,
        });

      const nativeBalance =
        await getNativeBalance(
          lockedJob.source_address
        );

      console.log(
        "SWEEP SOURCE BALANCE:",
        {
          jobId: lockedJob.id,
          network: lockedJob.network,
          asset: lockedJob.asset,
          sourceAddress:
            lockedJob.source_address,
          tokenBalance:
            tokenBalance.toString(),
          nativeBalance:
            nativeBalance.toString(),
        }
      );

      if (tokenBalance <= 0n) {
        throw new Error(
          "No token balance available for sweep"
        );
      }

      if (
        tokenBalance < sweepAmount
      ) {
        throw new Error(
          `Insufficient token balance. Required: ${sweepAmount.toString()}, Available: ${tokenBalance.toString()}`
        );
      }

      const addressResult =
        await pool.query(
          `SELECT
             derivation_index
           FROM deposit_addresses
           WHERE id = $1
           LIMIT 1`,
          [
            lockedJob.deposit_address_id,
          ]
        );

      if (
        addressResult.rows.length === 0
      ) {
        throw new Error(
          "Deposit address not found"
        );
      }

      const derivationIndex =
        Number(
          addressResult.rows[0]
            .derivation_index
        );

      if (
        !Number.isInteger(
          derivationIndex
        ) ||
        derivationIndex < 0
      ) {
        throw new Error(
          "Invalid deposit derivation index"
        );
      }

     const sourceWallet =
  getDepositWallet(
    lockedJob.network,
    derivationIndex
  ).connect(provider);

      if (
        sourceWallet.address.toLowerCase() !==
        lockedJob.source_address.toLowerCase()
      ) {
        throw new Error(
          "Derived deposit wallet does not match sweep source address"
        );
      }

      console.log(
        "SWEEP SOURCE WALLET VERIFIED:",
        {
          jobId: lockedJob.id,
          address:
            sourceWallet.address,
          derivationIndex,
        }
      );

      const tokenContract =
        new ethers.Contract(
          lockedJob.token_contract,
          [
            "function balanceOf(address owner) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
          ],
          sourceWallet.connect(
            provider
          )
        );

      const gasLimit =
        await tokenContract.transfer.estimateGas(
          lockedJob.destination_address,
          sweepAmount
        );

      let feeData =
        await provider.getFeeData();

      let gasPrice =
        feeData.maxFeePerGas ||
        feeData.gasPrice;

      if (!gasPrice) {
        throw new Error(
          "Unable to determine current gas price"
        );
      }

      let estimatedGasCost =
        gasLimit * gasPrice;

      let currentNativeBalance =
        nativeBalance;

      /*
       * GAS STATION
       *
       * If source deposit address does not
       * have enough native gas, the Hot Wallet
       * funds it automatically.
       */
      if (
        currentNativeBalance <
        estimatedGasCost
      ) {
        const gasFundingAmount =
          estimatedGasCost * 120n / 100n;

        const MIN_NATIVE_GAS =
          ethers.parseEther(
            "0.0001"
          );

        const finalGasFundingAmount =
          gasFundingAmount >
          MIN_NATIVE_GAS
            ? gasFundingAmount
            : MIN_NATIVE_GAS;

        const hotWalletBalance =
          await getNativeBalance(
            hotWallet.address
          );

        if (
          hotWalletBalance <
          finalGasFundingAmount
        ) {
          throw new Error(
            `Hot wallet has insufficient ETH for gas funding. Required: ${finalGasFundingAmount.toString()}, Available: ${hotWalletBalance.toString()}`
          );
        }

        console.log(
          "FUNDING SOURCE WALLET WITH GAS:",
          {
            jobId: lockedJob.id,
            sourceAddress:
              lockedJob.source_address,
            amount:
              finalGasFundingAmount.toString(),
          }
        );

        const gasFundingTx =
          await hotWallet.sendTransaction({
            to:
              lockedJob.source_address,
            value:
              finalGasFundingAmount,
          });

        console.log(
          "GAS FUNDING BROADCAST:",
          {
            jobId: lockedJob.id,
            txHash:
              gasFundingTx.hash,
          }
        );

        const gasFundingReceipt =
          await gasFundingTx.wait(1);

        if (!gasFundingReceipt) {
          throw new Error(
            "Gas funding transaction was not confirmed"
          );
        }

        console.log(
          "SOURCE WALLET GAS FUNDED:",
          {
            jobId: lockedJob.id,
            txHash:
              gasFundingTx.hash,
          }
        );

        /*
         * Refresh native balance and fee data
         * after gas funding.
         */
        currentNativeBalance =
          await getNativeBalance(
            lockedJob.source_address
          );

        feeData =
          await provider.getFeeData();

        gasPrice =
          feeData.maxFeePerGas ||
          feeData.gasPrice;

        if (!gasPrice) {
          throw new Error(
            "Unable to determine current gas price after gas funding"
          );
        }

        /*
         * Re-estimate gas after funding.
         */
        const refreshedGasLimit =
          await tokenContract.transfer.estimateGas(
            lockedJob.destination_address,
            sweepAmount
          );

        estimatedGasCost =
          refreshedGasLimit *
          gasPrice;

        if (
          currentNativeBalance <
          estimatedGasCost
        ) {
          throw new Error(
            `Insufficient gas after funding. Required: ${estimatedGasCost.toString()}, Available: ${currentNativeBalance.toString()}`
          );
        }

        console.log(
          "SOURCE WALLET GAS VERIFIED:",
          {
            jobId: lockedJob.id,
            nativeBalance:
              currentNativeBalance.toString(),
            requiredGas:
              estimatedGasCost.toString(),
          }
        );
      }

      /*
       * Final token balance check immediately
       * before creating/broadcasting the sweep.
       */
      const currentTokenBalance =
        await getTokenBalance({
          tokenContract:
            lockedJob.token_contract,
          walletAddress:
            sourceWallet.address,
        });

      if (
        currentTokenBalance <
        sweepAmount
      ) {
        throw new Error(
          `Source token balance changed. Required: ${sweepAmount.toString()}, Available: ${currentTokenBalance.toString()}`
        );
      }

      /*
       * Final gas refresh even when the source
       * already had enough gas.
       */
      feeData =
        await provider.getFeeData();

      gasPrice =
        feeData.maxFeePerGas ||
        feeData.gasPrice;

      if (!gasPrice) {
        throw new Error(
          "Unable to determine final gas price"
        );
      }

      const finalGasLimit =
        await tokenContract.transfer.estimateGas(
          lockedJob.destination_address,
          sweepAmount
        );

      const finalGasCost =
        finalGasLimit * gasPrice;

      currentNativeBalance =
        await getNativeBalance(
          lockedJob.source_address
        );

      if (
        currentNativeBalance <
        finalGasCost
      ) {
        throw new Error(
          `Insufficient native gas before sweep. Required: ${finalGasCost.toString()}, Available: ${currentNativeBalance.toString()}`
        );
      }

      console.log(
        "SWEEP GAS ESTIMATE:",
        {
          jobId: lockedJob.id,
          gasLimit:
            finalGasLimit.toString(),
          gasPrice:
            gasPrice.toString(),
          estimatedGasCost:
            finalGasCost.toString(),
        }
      );

      /*
       * Prevent accidental self-transfer.
       */
      if (
        lockedJob.destination_address
          .toLowerCase() ===
        sourceWallet.address
          .toLowerCase()
      ) {
        throw new Error(
          "Sweep destination cannot be the source wallet"
        );
      }

      const sweepTx =
        await tokenContract.transfer.populateTransaction(
          lockedJob.destination_address,
          sweepAmount
        );

      sweepTx.gasLimit =
        finalGasLimit;

      if (
        feeData.maxFeePerGas &&
        feeData.maxPriorityFeePerGas
      ) {
        sweepTx.maxFeePerGas =
          feeData.maxFeePerGas;

        sweepTx.maxPriorityFeePerGas =
          feeData.maxPriorityFeePerGas;
      } else if (
        feeData.gasPrice
      ) {
        sweepTx.gasPrice =
          feeData.gasPrice;
      }

      console.log(
        "SWEEP TRANSACTION PREPARED:",
        {
          jobId: lockedJob.id,
          from:
            sourceWallet.address,
          to:
            lockedJob.destination_address,
          tokenContract:
            lockedJob.token_contract,
          amount:
            sweepAmount.toString(),
          gasLimit:
            finalGasLimit.toString(),
        }
      );

      /*
       * IMPORTANT:
       * Final balance check happens BEFORE
       * sendTransaction().
       */
      const preBroadcastTokenBalance =
        await getTokenBalance({
          tokenContract:
            lockedJob.token_contract,
          walletAddress:
            sourceWallet.address,
        });

      if (
        preBroadcastTokenBalance <
        sweepAmount
      ) {
        throw new Error(
          `Source token balance changed before broadcast. Required: ${sweepAmount.toString()}, Available: ${preBroadcastTokenBalance.toString()}`
        );
      }

      const txResponse =
        await sourceWallet.sendTransaction(
          sweepTx
        );

      console.log(
        "SWEEP TRANSACTION BROADCAST:",
        {
          jobId: lockedJob.id,
          txHash:
            txResponse.hash,
        }
      );

      /*
       * Save tx hash immediately after
       * successful broadcast.
       */
      await pool.query(
        `UPDATE sweep_jobs
         SET
           status = 'broadcast',
           tx_hash = $1,
           broadcast_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP,
           last_error = NULL
         WHERE id = $2
           AND status = 'processing'`,
        [
          txResponse.hash,
          lockedJob.id,
        ]
      );

      /*
       * Wait for required confirmations.
       */
      const receipt =
        await provider.waitForTransaction(
          txResponse.hash,
          confirmations
        );

      if (!receipt) {
        throw new Error(
          "Sweep transaction confirmation timeout"
        );
      }

      if (
        receipt.status !== 1
      ) {
        throw new Error(
          "Sweep transaction failed on blockchain"
        );
      }

      await pool.query(
        `UPDATE sweep_jobs
         SET
           status = 'confirmed',
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP,
           last_error = NULL
         WHERE id = $1
           AND status = 'broadcast'`,
        [lockedJob.id]
      );

      console.log(
        "SWEEP CONFIRMED:",
        {
          jobId: lockedJob.id,
          txHash:
            txResponse.hash,
          confirmations,
        }
      );

    } catch (err) {
      /*
       * If the transaction was already broadcast,
       * DO NOT put the job back into queued.
       *
       * It must remain broadcast so that a
       * reconciliation process can inspect it.
       */
      try {
        const currentJob =
          await pool.query(
            `SELECT
               status,
               tx_hash,
               attempts
             FROM sweep_jobs
             WHERE id = $1
             LIMIT 1`,
            [job.id]
          );

        if (
          currentJob.rows.length > 0 &&
          currentJob.rows[0].status ===
            "broadcast"
        ) {
          await pool.query(
            `UPDATE sweep_jobs
             SET
               last_error = $1,
               updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
               AND status = 'broadcast'`,
            [
              err.message ||
                String(err),
              job.id,
            ]
          );
        } else {
          await pool.query(
            `UPDATE sweep_jobs
             SET
               status = CASE
                 WHEN attempts >= 10
                   THEN 'failed'
                 ELSE 'queued'
               END,
               last_error = $1,
               next_attempt_at = CASE
                 WHEN attempts >= 10
                   THEN NULL
                 ELSE CURRENT_TIMESTAMP +
                      INTERVAL '5 minutes'
               END,
               updated_at =
                 CURRENT_TIMESTAMP
             WHERE id = $2
               AND status = 'processing'`,
            [
              err.message ||
                String(err),
              job.id,
            ]
          );
        }
      } catch (dbError) {
        console.error(
          "SWEEP JOB ERROR-STATE UPDATE FAILED:",
          {
            jobId: job.id,
            error: dbError,
          }
        );
      }

      console.error(
        "SWEEP JOB WORKER ERROR:",
        {
          jobId: job.id,
          error: err,
        }
      );

      continue;
    }
  }
};

module.exports = {
  processEthereumSweepJobs,
};
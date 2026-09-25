const pool = require("../../../../config/db");
const { ethers } = require("ethers");

const { getProvider } = require("../../../blockchainService");

const HOT_WALLET_PRIVATE_KEY =
  process.env.EVM_HOT_WALLET_PRIVATE_KEY;

const HOT_WALLET_ADDRESS =
  process.env.EVM_DEPOSIT_WALLET_ADDRESS;

const ETHEREUM_CHAIN_ID =
  Number(process.env.ETHEREUM_CHAIN_ID);

const BLOCKCHAIN_CONFIRMATIONS =
  Number(process.env.BLOCKCHAIN_CONFIRMATIONS || 3);

const TOKEN_CONTRACTS = {
  USDC: process.env.SEPOLIA_USDC_CONTRACT,
  USDT: process.env.SEPOLIA_USDT_CONTRACT,
};

const TOKEN_DECIMALS = {
  USDC: 6,
  USDT: 6,
};


/* =========================================================
   HOT WALLET
========================================================= */

const getHotWallet = () => {

  if (!HOT_WALLET_PRIVATE_KEY) {
    throw new Error(
      "EVM_HOT_WALLET_PRIVATE_KEY is not configured"
    );
  }

  const provider = getProvider();

  return new ethers.Wallet(
    HOT_WALLET_PRIVATE_KEY,
    provider
  );
};


/* =========================================================
   REFUND FAILED WITHDRAWAL
========================================================= */

const refundFailedWithdrawal = async (
  withdrawalId
) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const result = await client.query(
      `SELECT
         id,
         stbx_uid,
         asset,
         amount,
         status
       FROM withdrawals
       WHERE id = $1
       FOR UPDATE`,
      [withdrawalId]
    );

    if (result.rows.length === 0) {

      throw new Error(
        "Withdrawal not found during refund"
      );

    }

    const withdrawal = result.rows[0];

    if (
      withdrawal.status !== "pending" &&
      withdrawal.status !== "processing"
    ) {

      await client.query("ROLLBACK");

      return;

    }

    await client.query(
      `UPDATE wallet_balances
       SET
         balance = balance + $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE stbx_uid = $2
         AND asset = $3`,
      [
        withdrawal.amount,
        withdrawal.stbx_uid,
        withdrawal.asset,
      ]
    );

    await client.query(
      `UPDATE withdrawals
       SET
         status = 'failed',
         error_message =
           'Ethereum withdrawal failed and balance was refunded',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND status IN ('pending', 'processing')`,
      [withdrawalId]
    );

    await client.query("COMMIT");

    console.log(
      "ETHEREUM WITHDRAWAL REFUNDED:",
      {
        withdrawalId,
        stbx_uid: withdrawal.stbx_uid,
        asset: withdrawal.asset,
        amount: String(
          withdrawal.amount
        ),
      }
    );

  } catch (err) {

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "WITHDRAW REFUND ROLLBACK ERROR:",
        rollbackError
      );
    }

    throw err;

  } finally {

    client.release();

  }

};


/* =========================================================
   PROCESS SINGLE ETHEREUM WITHDRAWAL
========================================================= */

const processEthereumWithdrawal = async (
  withdrawal
) => {

  const provider = getProvider();


  /* -------------------------------------------------------
     NETWORK
  ------------------------------------------------------- */

  if (withdrawal.network !== "ethereum") {

    throw new Error(
      "Invalid Ethereum withdrawal network"
    );

  }


  /* -------------------------------------------------------
     CHAIN ID
  ------------------------------------------------------- */

  if (
    !Number.isInteger(ETHEREUM_CHAIN_ID) ||
    ETHEREUM_CHAIN_ID <= 0
  ) {

    throw new Error(
      "Invalid ETHEREUM_CHAIN_ID configuration"
    );

  }


  /* -------------------------------------------------------
     ASSET
  ------------------------------------------------------- */

  const asset = withdrawal.asset;

  if (
    !["USDT", "USDC"].includes(asset)
  ) {

    throw new Error(
      `Unsupported asset: ${asset}`
    );

  }

  const tokenAddress =
    TOKEN_CONTRACTS[asset];

  if (!tokenAddress) {

    throw new Error(
      `Token contract not configured for ${asset}`
    );

  }

  if (!ethers.isAddress(tokenAddress)) {

    throw new Error(
      `Invalid token contract for ${asset}`
    );

  }


  /* -------------------------------------------------------
     DESTINATION
  ------------------------------------------------------- */

  if (
    !ethers.isAddress(
      withdrawal.destination_address
    )
  ) {

    throw new Error(
      "Invalid Ethereum destination address"
    );

  }


  /* -------------------------------------------------------
     HOT WALLET
  ------------------------------------------------------- */

  const hotWallet = getHotWallet();

  if (
    HOT_WALLET_ADDRESS &&
    hotWallet.address.toLowerCase() !==
      HOT_WALLET_ADDRESS.toLowerCase()
  ) {

    throw new Error(
      "Hot wallet address mismatch"
    );

  }


  /* -------------------------------------------------------
     NATIVE GAS BALANCE
  ------------------------------------------------------- */

  const hotWalletEthBalance =
    await provider.getBalance(
      hotWallet.address
    );

  if (hotWalletEthBalance === 0n) {

    throw new Error(
      "Hot Wallet has insufficient ETH for withdrawal gas"
    );

  }


  /* -------------------------------------------------------
     TOKEN CONTRACT
  ------------------------------------------------------- */

  const tokenAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];

  const tokenContract =
    new ethers.Contract(
      tokenAddress,
      tokenAbi,
      hotWallet
    );


  /* -------------------------------------------------------
     AMOUNT + FEE
  ------------------------------------------------------- */

  const decimals =
    TOKEN_DECIMALS[asset];

  if (!decimals) {

    throw new Error(
      `Token decimals not configured for ${asset}`
    );

  }

  const withdrawalAmount =
    ethers.parseUnits(
      String(withdrawal.amount),
      decimals
    );

  const withdrawalFee =
    ethers.parseUnits(
      String(withdrawal.fee || 0),
      decimals
    );

  if (withdrawalAmount <= 0n) {

    throw new Error(
      "Withdrawal amount must be greater than zero"
    );

  }

  if (withdrawalFee < 0n) {

    throw new Error(
      "Withdrawal fee cannot be negative"
    );

  }

  if (
    withdrawalFee >= withdrawalAmount
  ) {

    throw new Error(
      "Withdrawal fee must be lower than withdrawal amount"
    );

  }

  const amountToSend =
    withdrawalAmount - withdrawalFee;


  /* -------------------------------------------------------
     HOT WALLET TOKEN BALANCE
  --------------------------------------------------------- */

  const hotWalletBalance =
    await tokenContract.balanceOf(
      hotWallet.address
    );

  if (
    hotWalletBalance < amountToSend
  ) {

    throw new Error(
      `Insufficient ${asset} balance in Hot Wallet`
    );

  }


  /* -------------------------------------------------------
     GAS ESTIMATION
  --------------------------------------------------------- */

  const gasEstimate =
    await tokenContract.transfer.estimateGas(
      withdrawal.destination_address,
      amountToSend
    );

  const feeData =
    await provider.getFeeData();

  if (!feeData.maxFeePerGas) {

    throw new Error(
      "Ethereum gas fee data unavailable"
    );

  }

  const estimatedGasCost =
    gasEstimate *
    feeData.maxFeePerGas;

  if (
    hotWalletEthBalance <
    estimatedGasCost
  ) {

    throw new Error(
      "Hot Wallet has insufficient ETH for withdrawal gas"
    );

  }


  /* -------------------------------------------------------
     NONCE
  --------------------------------------------------------- */

  const nonce =
    await provider.getTransactionCount(
      hotWallet.address,
      "pending"
    );

  await pool.query(
    `UPDATE withdrawals
     SET
       blockchain_nonce = $1,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
       AND status = 'processing'`,
    [
      nonce,
      withdrawal.id,
    ]
  );


  /* -------------------------------------------------------
     BROADCAST ERC-20 TRANSFER
  --------------------------------------------------------- */

  const tx =
    await tokenContract.transfer(
      withdrawal.destination_address,
      amountToSend,
      {
        nonce,
      }
    );


  /* -------------------------------------------------------
     SAVE TX HASH
  --------------------------------------------------------- */

  await pool.query(
    `UPDATE withdrawals
     SET
       status = 'broadcast',
       blockchain_tx_hash = $1,
       broadcast_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP,
       error_message = NULL
     WHERE id = $2
       AND status = 'processing'`,
    [
      tx.hash,
      withdrawal.id,
    ]
  );

  console.log(
    "ETHEREUM WITHDRAWAL BROADCAST:",
    {
      withdrawalId: withdrawal.id,
      asset,
      amount: String(
        withdrawal.amount
      ),
      fee: String(
        withdrawal.fee || 0
      ),
      amountSent: ethers.formatUnits(
        amountToSend,
        decimals
      ),
      nonce,
      txHash: tx.hash,
    }
  );


  /* -------------------------------------------------------
     WAIT FOR CONFIRMATIONS
  --------------------------------------------------------- */

  const receipt =
    await tx.wait(
      BLOCKCHAIN_CONFIRMATIONS
    );

  if (
    !receipt ||
    receipt.status !== 1
  ) {

    throw new Error(
      "Ethereum withdrawal transaction failed"
    );

  }


  /* -------------------------------------------------------
     CONFIRMED
  --------------------------------------------------------- */

  await pool.query(
    `UPDATE withdrawals
     SET
       status = 'confirmed',
       confirmed_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP,
       error_message = NULL
     WHERE id = $1
       AND status = 'broadcast'`,
    [withdrawal.id]
  );

    await pool.query(
    `
    INSERT INTO withdrawal_fee_revenue (
      withdrawal_id,
      "STRId",
      stbx_uid,
      asset,
      network,
      mode,
      fee,
      blockchain_tx_hash,
      status
    )
    SELECT
      id,
      "STRId",
      stbx_uid,
      asset,
      network,
      mode,
      fee,
      blockchain_tx_hash,
      'collected'
    FROM withdrawals
    WHERE id = $1
    ON CONFLICT (withdrawal_id) DO NOTHING
    `,
    [withdrawal.id]
  );

  console.log(
    "ETHEREUM WITHDRAWAL CONFIRMED:",
    {
      withdrawalId: withdrawal.id,
      txHash: tx.hash,
      confirmations:
        BLOCKCHAIN_CONFIRMATIONS,
    }
  );

  return {
    success: true,
    txHash: tx.hash,
  };

};


/* =========================================================
   STALE PROCESSING RECOVERY
========================================================= */

const recoverStaleEthereumWithdrawals =
  async () => {

    const result = await pool.query(
      `SELECT
         id,
         blockchain_nonce,
         blockchain_tx_hash
       FROM withdrawals
       WHERE network = 'ethereum'
         AND status = 'processing'
         AND updated_at <
             CURRENT_TIMESTAMP - INTERVAL '10 minutes'
       ORDER BY updated_at ASC
       LIMIT 20`
    );


    for (
      const withdrawal
      of result.rows
    ) {

      try {

        /*
         * If tx hash exists, the transaction was already
         * broadcast. Never send it again.
         */

        if (
          withdrawal.blockchain_tx_hash
        ) {

          await pool.query(
            `UPDATE withdrawals
             SET
               status = 'broadcast',
               updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
               AND status = 'processing'`,
            [withdrawal.id]
          );

          console.log(
            "ETHEREUM STALE WITHDRAWAL RECOVERED AS BROADCAST:",
            {
              withdrawalId:
                withdrawal.id,
              txHash:
                withdrawal.blockchain_tx_hash,
            }
          );

          continue;

        }


        /*
         * No tx hash.
         *
         * We have a reserved nonce, therefore we MUST NOT
         * blindly return the withdrawal to pending.
         */

        const provider =
          getProvider();

        const hotWallet =
          getHotWallet();

        const latestNonce =
          await provider.getTransactionCount(
            hotWallet.address,
            "latest"
          );

        const pendingNonce =
          await provider.getTransactionCount(
            hotWallet.address,
            "pending"
          );

        const reservedNonce =
          Number(
            withdrawal.blockchain_nonce
          );

        console.warn(
          "ETHEREUM WITHDRAWAL NONCE RECONCILIATION REQUIRED:",
          {
            withdrawalId:
              withdrawal.id,
            reservedNonce,
            latestNonce,
            pendingNonce,
          }
        );

        /*
         * IMPORTANT:
         *
         * If nonce was already consumed but tx hash is missing,
         * we cannot safely assume which transaction consumed it.
         *
         * Therefore do NOT automatically retry.
         */

        if (
          Number.isInteger(
            reservedNonce
          ) &&
          reservedNonce <
            latestNonce
        ) {

          console.error(
            "ETHEREUM WITHDRAWAL NONCE ALREADY CONSUMED WITHOUT TX HASH:",
            {
              withdrawalId:
                withdrawal.id,
              reservedNonce,
              latestNonce,
            }
          );

          continue;

        }

        /*
         * If the nonce is still pending/not consumed,
         * leave the withdrawal untouched.
         *
         * Automatic retry is intentionally avoided here.
         */

        console.warn(
          "ETHEREUM WITHDRAWAL STILL REQUIRES SAFE RECOVERY:",
          {
            withdrawalId:
              withdrawal.id,
            reservedNonce,
            pendingNonce,
          }
        );

      } catch (err) {

        console.error(
          "ETHEREUM STALE WITHDRAWAL RECOVERY ERROR:",
          {
            withdrawalId:
              withdrawal.id,
            error:
              err.message,
          }
        );

      }

    }

  };


/* =========================================================
   BROADCAST RECONCILIATION
========================================================= */

const reconcileBroadcastEthereumWithdrawals =
  async () => {

    const provider =
      getProvider();

    const result = await pool.query(
      `SELECT
         id,
         blockchain_tx_hash
       FROM withdrawals
       WHERE network = 'ethereum'
         AND status = 'broadcast'
         AND blockchain_tx_hash IS NOT NULL
       ORDER BY updated_at ASC
       LIMIT 20`
    );

    if (
      result.rows.length === 0
    ) {

      return;

    }

    const currentBlock =
      await provider.getBlockNumber();


    for (
      const withdrawal
      of result.rows
    ) {

      try {

        const receipt =
          await provider.getTransactionReceipt(
            withdrawal.blockchain_tx_hash
          );

        if (!receipt) {

          console.log(
            "ETHEREUM WITHDRAWAL TX STILL PENDING:",
            {
              withdrawalId:
                withdrawal.id,
              txHash:
                withdrawal.blockchain_tx_hash,
            }
          );

          continue;

        }


        const confirmations =
          currentBlock -
          receipt.blockNumber +
          1;


        /* ---------------------------------------------------
           BLOCKCHAIN TX FAILED
        --------------------------------------------------- */

        if (
          receipt.status !== 1
        ) {

          const client =
            await pool.connect();

          try {

            await client.query(
              "BEGIN"
            );

            const withdrawalResult =
              await client.query(
                `SELECT
                   id,
                   stbx_uid,
                   asset,
                   amount,
                   status
                 FROM withdrawals
                 WHERE id = $1
                 FOR UPDATE`,
                [withdrawal.id]
              );

            if (
              withdrawalResult.rows.length === 0
            ) {

              throw new Error(
                "Withdrawal not found during failed transaction refund"
              );

            }

            const currentWithdrawal =
              withdrawalResult.rows[0];

            if (
              currentWithdrawal.status !==
              "broadcast"
            ) {

              await client.query(
                "ROLLBACK"
              );

              continue;

            }


            await client.query(
              `UPDATE wallet_balances
               SET
                 balance = balance + $1,
                 updated_at = CURRENT_TIMESTAMP
               WHERE stbx_uid = $2
                 AND asset = $3`,
              [
                currentWithdrawal.amount,
                currentWithdrawal.stbx_uid,
                currentWithdrawal.asset,
              ]
            );


            await client.query(
              `UPDATE withdrawals
               SET
                 status = 'failed',
                 error_message =
                   'Ethereum withdrawal transaction failed on blockchain and balance was refunded',
                 updated_at = CURRENT_TIMESTAMP
               WHERE id = $1
                 AND status = 'broadcast'`,
              [withdrawal.id]
            );


            await client.query(
              "COMMIT"
            );


            console.error(
              "ETHEREUM WITHDRAWAL TX FAILED AND REFUNDED:",
              {
                withdrawalId:
                  withdrawal.id,
                txHash:
                  withdrawal.blockchain_tx_hash,
              }
            );

          } catch (err) {

            try {
              await client.query(
                "ROLLBACK"
              );
            } catch (
              rollbackError
            ) {

              console.error(
                "WITHDRAWAL REFUND ROLLBACK ERROR:",
                rollbackError
              );

            }

            console.error(
              "ETHEREUM WITHDRAWAL REFUND ERROR:",
              {
                withdrawalId:
                  withdrawal.id,
                error:
                  err.message,
              }
            );

          } finally {

            client.release();

          }

          continue;

        }


        /* ---------------------------------------------------
           WAIT FOR CONFIRMATIONS
        --------------------------------------------------- */

        if (
          confirmations <
          BLOCKCHAIN_CONFIRMATIONS
        ) {

          console.log(
            "ETHEREUM WITHDRAWAL WAITING CONFIRMATIONS:",
            {
              withdrawalId:
                withdrawal.id,
              txHash:
                withdrawal.blockchain_tx_hash,
              confirmations,
              required:
                BLOCKCHAIN_CONFIRMATIONS,
            }
          );

          continue;

        }


        /* ---------------------------------------------------
           CONFIRMED
        --------------------------------------------------- */

        await pool.query(
          `UPDATE withdrawals
           SET
             status = 'confirmed',
             confirmed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP,
             error_message = NULL
           WHERE id = $1
             AND status = 'broadcast'`,
          [withdrawal.id]
        );
                  
  await pool.query(
  `INSERT INTO withdrawal_fee_revenue (
    withdrawal_id,
    "STRId",
    stbx_uid,
    asset,
    network,
    mode,
    fee,
    blockchain_tx_hash,
    status
  )
  SELECT
    id,
    "STRId",
    stbx_uid,
    asset,
    network,
    mode,
    fee,
    blockchain_tx_hash,
    'collected'
  FROM withdrawals
  WHERE id = $1
  ON CONFLICT (withdrawal_id) DO NOTHING
  `,
  [withdrawal.id]
);

        console.log(
          "ETHEREUM WITHDRAWAL RECONCILED:",
          {
            withdrawalId:
              withdrawal.id,
            txHash:
              withdrawal.blockchain_tx_hash,
            confirmations,
          }
        );

      } catch (err) {

        console.error(
          "ETHEREUM WITHDRAWAL RECONCILIATION ERROR:",
          {
            withdrawalId:
              withdrawal.id,
            error:
              err.message,
          }
        );

      }

    }

  };


/* =========================================================
   PROCESS PENDING ETHEREUM WITHDRAWALS
========================================================= */

const processPendingEthereumWithdrawals =
  async () => {

    await recoverStaleEthereumWithdrawals();

    await reconcileBroadcastEthereumWithdrawals();


    /*
     * Claim exactly ONE pending withdrawal.
     *
     * FOR UPDATE SKIP LOCKED prevents another worker
     * from claiming the same row.
     */

    const result =
      await pool.query(
        `WITH next_withdrawal AS (
           SELECT id
           FROM withdrawals
           WHERE network = 'ethereum'
             AND status = 'pending'
           ORDER BY created_at ASC
           FOR UPDATE SKIP LOCKED
           LIMIT 1
         )
         UPDATE withdrawals w
         SET
           status = 'processing',
           updated_at = CURRENT_TIMESTAMP
         FROM next_withdrawal nw
         WHERE w.id = nw.id
         RETURNING
           w.id,
           w.stbx_uid,
           w.asset,
           w.amount,
           w.fee,
           w.network,
           w.mode,
           w.destination_address,
           w.status,
           w.blockchain_tx_hash`
      );


    for (
      const withdrawal
      of result.rows
    ) {

      try {

        await processEthereumWithdrawal(
          withdrawal
        );

      } catch (err) {

        console.error(
          "ETHEREUM WITHDRAWAL ERROR:",
          {
            withdrawalId:
              withdrawal.id,
            error:
              err.message,
          }
        );


        /*
         * IMPORTANT:
         *
         * If transaction has already been broadcast,
         * do NOT refund here.
         *
         * Reconciliation will handle the blockchain
         * transaction using blockchain_tx_hash.
         */

        const current =
          await pool.query(
            `SELECT
               status,
               blockchain_tx_hash
             FROM withdrawals
             WHERE id = $1`,
            [withdrawal.id]
          );


        if (
          current.rows.length > 0 &&
          current.rows[0].status ===
            "broadcast"
        ) {

          console.log(
            "ETHEREUM WITHDRAWAL ALREADY BROADCAST; SKIPPING IMMEDIATE REFUND:",
            {
              withdrawalId:
                withdrawal.id,
              txHash:
                current.rows[0]
                  .blockchain_tx_hash,
            }
          );

          continue;

        }


        /*
         * Only pre-broadcast failures are immediately refunded.
         */

        try {

          await refundFailedWithdrawal(
            withdrawal.id
          );

        } catch (refundError) {

          console.error(
            "ETHEREUM WITHDRAWAL REFUND ERROR:",
            {
              withdrawalId:
                withdrawal.id,
              error:
                refundError.message,
            }
          );

        }

      }

    }

  };
  
module.exports = {
  processEthereumWithdrawal,
  processPendingEthereumWithdrawals,
  refundFailedWithdrawal,
  reconcileBroadcastEthereumWithdrawals,
};
const pool = require("../config/db");
const {
  getPendingSweepJobs,
} = require("./sweepJobService");
const { ethers } = require("ethers");
const { getProvider } = require("./blockchainService");
const {
  getDepositWallet,
} = require("./walletService");



const provider = getProvider();
const confirmations = Number(
  process.env.BLOCKCHAIN_CONFIRMATIONS || 3
);

const HOT_WALLET_PRIVATE_KEY =
  process.env.EVM_HOT_WALLET_PRIVATE_KEY;

if (!HOT_WALLET_PRIVATE_KEY) {
  throw new Error(
    "EVM_HOT_WALLET_PRIVATE_KEY is not configured"
  );
}
const hotWallet = new ethers.Wallet(
  HOT_WALLET_PRIVATE_KEY,
  provider
);
if (
  hotWallet.address.toLowerCase() !==
  HOT_WALLET_ADDRESS.toLowerCase()
) {
  throw new Error(
    "Hot wallet private key does not match EVM_DEPOSIT_WALLET_ADDRESS"
  );
}

const HOT_WALLET_ADDRESS =
  process.env.EVM_DEPOSIT_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS) {
  throw new Error(
    "EVM_DEPOSIT_WALLET_ADDRESS is not configured"
  );
}
if (!ethers.isAddress(HOT_WALLET_ADDRESS)) {
  throw new Error(
    "EVM_DEPOSIT_WALLET_ADDRESS is invalid"
  );
}

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

const processEvmSweepJobs = async () => {
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
           AND status IN ('queued', 'processing')
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
        continue;
      }

      const lockedJob = lockResult.rows[0];

      validateSweepAddresses({
  sourceAddress: lockedJob.source_address,
  destinationAddress: lockedJob.destination_address,
});

const tokenBalance = await getTokenBalance({
  tokenContract: lockedJob.token_contract,
  walletAddress: lockedJob.source_address,
});

const nativeBalance = await getNativeBalance(
  lockedJob.source_address
);
const addressResult = await pool.query(
  `SELECT derivation_index
   FROM deposit_addresses
   WHERE id = $1
   LIMIT 1`,
  [lockedJob.deposit_address_id]
);
if (addressResult.rows.length === 0) {
  throw new Error("Deposit address not found");
}
const derivationIndex =
  Number(addressResult.rows[0].derivation_index);

  const sourceWallet = getDepositWallet(
  lockedJob.network,
  derivationIndex
);
if (
  sourceWallet.address.toLowerCase() !==
  lockedJob.source_address.toLowerCase()
) {
  throw new Error(
    "Derived deposit wallet does not match sweep source address"
  );
}

console.log("SWEEP SOURCE BALANCE:", {
  jobId: lockedJob.id,
  network: lockedJob.network,
  asset: lockedJob.asset,
  sourceAddress: lockedJob.source_address,
  tokenBalance: tokenBalance.toString(),
  nativeBalance: nativeBalance.toString(),
});

console.log("SWEEP SOURCE WALLET VERIFIED:", {
  jobId: lockedJob.id,
  address: sourceWallet.address,
  derivationIndex,
});

const tokenContract = new ethers.Contract(
  lockedJob.token_contract,
  [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
  ],
  sourceWallet.connect(provider)
);


const MIN_NATIVE_GAS = ethers.parseEther("0.0001");

if (nativeBalance < MIN_NATIVE_GAS) {
  console.log("SOURCE WALLET NEEDS GAS:", {
    jobId: lockedJob.id,
    sourceAddress: lockedJob.source_address,
    nativeBalance: nativeBalance.toString(),
  });
}

if (tokenBalance <= 0n) {
  throw new Error(
    "No token balance available for sweep"
  );
}

const sweepAmount = BigInt(lockedJob.amount);
if (sweepAmount <= 0n) {
  throw new Error(
    "Invalid sweep amount"
  );
}
if (tokenBalance < sweepAmount) {
  throw new Error(
    `Insufficient token balance. Required: ${sweepAmount.toString()}, Available: ${tokenBalance.toString()}`
  );
}
const gasLimit = await tokenContract.transfer.estimateGas(
  lockedJob.destination_address,
  sweepAmount
);

const feeData = await provider.getFeeData();
const gasPrice =
  feeData.maxFeePerGas ||
  feeData.gasPrice;
if (!gasPrice) {
  throw new Error(
    "Unable to determine current gas price"
  );
}
const estimatedGasCost =
  gasLimit * gasPrice;

if (nativeBalance < estimatedGasCost) {
  const gasFundingAmount =
    estimatedGasCost * 120n / 100n;

  const finalGasFundingAmount =
    gasFundingAmount > MIN_NATIVE_GAS
      ? gasFundingAmount
      : MIN_NATIVE_GAS;

  const hotWalletBalance =
    await provider.getBalance(
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

  console.log("FUNDING SOURCE WALLET WITH GAS:", {
    jobId: lockedJob.id,
    sourceAddress: lockedJob.source_address,
    amount: finalGasFundingAmount.toString(),
  });

  const gasFundingTx =
    await hotWallet.sendTransaction({
      to: lockedJob.source_address,
      value: finalGasFundingAmount,
    });

  console.log("GAS FUNDING BROADCAST:", {
    jobId: lockedJob.id,
    txHash: gasFundingTx.hash,
  });

  const gasFundingReceipt =
    await gasFundingTx.wait(1);

  if (!gasFundingReceipt) {
    throw new Error(
      "Gas funding transaction was not confirmed"
    );
  }

  console.log("SOURCE WALLET GAS FUNDED:", {
    jobId: lockedJob.id,
    txHash: gasFundingTx.hash,
  });
}

console.log("SWEEP GAS ESTIMATE:", {
  jobId: lockedJob.id,
  gasLimit: gasLimit.toString(),
  gasPrice: gasPrice.toString(),
  estimatedGasCost: estimatedGasCost.toString(),
});

const sweepTx = await tokenContract.transfer.populateTransaction(
  lockedJob.destination_address,
  sweepAmount
);

sweepTx.gasLimit = gasLimit;

if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
  sweepTx.maxFeePerGas = feeData.maxFeePerGas;
  sweepTx.maxPriorityFeePerGas =
    feeData.maxPriorityFeePerGas;
} else if (feeData.gasPrice) {
  sweepTx.gasPrice = feeData.gasPrice;
}

console.log("SWEEP TRANSACTION PREPARED:", {
  jobId: lockedJob.id,
  from: sourceWallet.address,
  to: lockedJob.destination_address,
  tokenContract: lockedJob.token_contract,
  amount: sweepAmount.toString(),
  gasLimit: gasLimit.toString(),
});

const txResponse = await sourceWallet.sendTransaction(
  sweepTx
);
console.log("SWEEP TRANSACTION BROADCAST:", {
  jobId: lockedJob.id,
  txHash: txResponse.hash,
});

await pool.query(
  `UPDATE sweep_jobs
   SET
     status = 'broadcast',
     tx_hash = $1,
     broadcast_at = CURRENT_TIMESTAMP,
     updated_at = CURRENT_TIMESTAMP,
     last_error = NULL
   WHERE id = $2`,
  [
    txResponse.hash,
    lockedJob.id,
  ]
);

const receipt = await provider.waitForTransaction(
  txResponse.hash,
  confirmations
);

if (!receipt) {
  throw new Error(
    "Sweep transaction confirmation timeout"
  );
}

if (receipt.status !== 1) {
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

console.log("SWEEP CONFIRMED:", {
  jobId: lockedJob.id,
  txHash: txResponse.hash,
  confirmations,
});

      await client.query("COMMIT");

      console.log(
        "SWEEP JOB QUEUED FOR PROCESSING:",
        {
          id: lockedJob.id,
          network: lockedJob.network,
          asset: lockedJob.asset,
          source: lockedJob.source_address,
          destination: lockedJob.destination_address,
          amount: lockedJob.amount,
          attempts: lockedJob.attempts,
        }
      );
    } catch (err) {
      await client.query("ROLLBACK");

      await pool.query(
        `UPDATE sweep_jobs
         SET
           status = CASE
             WHEN attempts >= 10 THEN 'failed'
             ELSE 'queued'
           END,
           last_error = $1,
           next_attempt_at = CASE
             WHEN attempts >= 10 THEN NULL
             ELSE CURRENT_TIMESTAMP + INTERVAL '5 minutes'
           END,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
           AND status = 'processing'`,
        [
          err.message || String(err),
          job.id,
        ]
      );

      console.error(
        "SWEEP JOB WORKER ERROR:",
        {
          jobId: job.id,
          error: err,
        }
      );

      client.release();
      continue;
    }

    client.release();
  }
};

module.exports = {
  processEvmSweepJobs,
};
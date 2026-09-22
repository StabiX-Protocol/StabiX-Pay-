const pool = require("../config/db");
const { ethers } = require("ethers");

const { getProvider } = require("./blockchainService");

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
         error_message = 'Ethereum withdrawal failed and balance was refunded',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND status = 'pending'`,
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

const processEthereumWithdrawal = async (
  withdrawal
) => {
  const provider = getProvider();

  if (
    Number(withdrawal.network) &&
    Number(withdrawal.network) !== ETHEREUM_CHAIN_ID
  ) {
    throw new Error(
      "Invalid Ethereum withdrawal chain"
    );
  }

  const asset = withdrawal.asset;

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

  if (
    !ethers.isAddress(
      withdrawal.destination_address
    )
  ) {
    throw new Error(
      "Invalid Ethereum destination address"
    );
  }

  const hotWallet = getHotWallet();
 const hotWalletEthBalance =
  await provider.getBalance(
    hotWallet.address
  );

if (hotWalletEthBalance === 0n) {
  throw new Error(
    "Hot Wallet has insufficient ETH for withdrawal gas"
  );
}

  if (
    HOT_WALLET_ADDRESS &&
    hotWallet.address.toLowerCase() !==
      HOT_WALLET_ADDRESS.toLowerCase()
  ) {
    throw new Error(
      "Hot wallet address mismatch"
    );
  }

  const tokenAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];

  const tokenContract = new ethers.Contract(
    tokenAddress,
    tokenAbi,
    hotWallet
  );

  const decimals =
    TOKEN_DECIMALS[asset];

 const withdrawalAmount =
  ethers.parseUnits(
    String(withdrawal.amount),
    decimals
  );

const withdrawalFee =
  ethers.parseUnits(
    String(withdrawal.fee),
    decimals
  );

if (withdrawalFee >= withdrawalAmount) {
  throw new Error(
    "Withdrawal fee must be lower than withdrawal amount"
  );
}

const amountToSend =
  withdrawalAmount - withdrawalFee;

  const hotWalletBalance =
    await tokenContract.balanceOf(
      hotWallet.address
    );

 if (hotWalletBalance < amountToSend) {
    throw new Error(
      `Insufficient ${asset} balance in Hot Wallet`
    );
  }

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
  gasEstimate * feeData.maxFeePerGas;

if (
  hotWalletEthBalance <
  estimatedGasCost
) {
  throw new Error(
    "Hot Wallet has insufficient ETH for withdrawal gas"
  );
}

 const tx =
  await tokenContract.transfer(
    withdrawal.destination_address,
    amountToSend
  );

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
      amount: String(withdrawal.amount),
      txHash: tx.hash,
    }
  );

  const receipt =
    await tx.wait(
      BLOCKCHAIN_CONFIRMATIONS
    );

  if (!receipt || receipt.status !== 1) {
    throw new Error(
      "Ethereum withdrawal transaction failed"
    );
  }

  await pool.query(
    `UPDATE withdrawals
     SET
       status = 'completed',
       confirmed_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP,
       error_message = NULL
     WHERE id = $1
       AND status = 'broadcast'`,
    [withdrawal.id]
  );

  console.log(
    "ETHEREUM WITHDRAWAL CONFIRMED:",
    {
      withdrawalId: withdrawal.id,
      txHash: tx.hash,
    }
  );

  return {
    success: true,
    txHash: tx.hash,
  };
};

const recoverStaleEthereumWithdrawals = async () => {
  const result = await pool.query(
    `UPDATE withdrawals
     SET
       status = 'pending',
       updated_at = CURRENT_TIMESTAMP,
       error_message = NULL
     WHERE network = 'ethereum'
       AND status = 'processing'
       AND updated_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes'
     RETURNING id`
  );

  if (result.rows.length > 0) {
    console.log(
      "STALE ETHEREUM WITHDRAWALS RECOVERED:",
      result.rows.map((row) => row.id)
    );
  }
};

const reconcileBroadcastEthereumWithdrawals = async () => {
  const provider = getProvider();

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

  if (result.rows.length === 0) {
    return;
  }

  const currentBlock =
    await provider.getBlockNumber();

  for (const withdrawal of result.rows) {
    try {
      const receipt =
        await provider.getTransactionReceipt(
          withdrawal.blockchain_tx_hash
        );

      if (!receipt) {
        console.log(
          "ETHEREUM WITHDRAWAL TX STILL PENDING:",
          {
            withdrawalId: withdrawal.id,
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
if (receipt.status !== 1) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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
      await client.query("ROLLBACK");
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
         error_message = 'Ethereum withdrawal transaction failed on blockchain and balance was refunded',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND status = 'broadcast'`,
      [withdrawal.id]
    );

    await client.query("COMMIT");

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
      await client.query("ROLLBACK");
    } catch (rollbackError) {
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
        error: err.message,
      }
    );
  } finally {
    client.release();
  }

  continue;
}

      if (
        confirmations <
        BLOCKCHAIN_CONFIRMATIONS
      ) {
        console.log(
          "ETHEREUM WITHDRAWAL WAITING CONFIRMATIONS:",
          {
            withdrawalId: withdrawal.id,
            txHash:
              withdrawal.blockchain_tx_hash,
            confirmations,
          }
        );

        continue;
      }

      await pool.query(
        `UPDATE withdrawals
         SET
           status = 'completed',
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP,
           error_message = NULL
         WHERE id = $1
           AND status = 'broadcast'`,
        [withdrawal.id]
      );

      console.log(
        "ETHEREUM WITHDRAWAL RECONCILED:",
        {
          withdrawalId: withdrawal.id,
          txHash:
            withdrawal.blockchain_tx_hash,
          confirmations,
        }
      );
    } catch (err) {
      console.error(
        "ETHEREUM WITHDRAWAL RECONCILIATION ERROR:",
        {
          withdrawalId: withdrawal.id,
          error: err.message,
        }
      );
    }
  }
};

const processPendingEthereumWithdrawals =
  async () => {
    await recoverStaleEthereumWithdrawals();

    await reconcileBroadcastEthereumWithdrawals();
    const result = await pool.query(
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

    for (const withdrawal of result.rows) {
      try {
        await processEthereumWithdrawal(
          withdrawal
        );
     } catch (err) {
        console.error(
          "ETHEREUM WITHDRAWAL ERROR:",
          {
            withdrawalId: withdrawal.id,
            error: err.message,
          }
        );

        try {
          await refundFailedWithdrawal(
            withdrawal.id
          );
        } catch (refundError) {
          console.error(
            "ETHEREUM WITHDRAWAL REFUND ERROR:",
            {
              withdrawalId: withdrawal.id,
              error: refundError.message,
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
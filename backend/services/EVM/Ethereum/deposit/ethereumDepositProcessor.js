const { ethers } = require("ethers");

const { getProvider } = require("../../../blockchainService");
const { creditConfirmedDeposit } = require("../../../depositCreditService");
const pool = require("../../../../config/db");

const provider = getProvider();

const confirmations = Number(
  process.env.BLOCKCHAIN_CONFIRMATIONS || 3
);

const TRANSFER_ABI = [
  "function decimals() view returns (uint8)",
];

const tokenConfig = [
  {
    asset: "USDC",
    address:
      process.env.SEPOLIA_USDC_CONTRACT || null,
  },
  {
    asset: "USDT",
    address:
      process.env.SEPOLIA_USDT_CONTRACT || null,
  },
].filter((token) => token.address);

const tokenMap = new Map();

for (const token of tokenConfig) {
  tokenMap.set(
    token.address.toLowerCase(),
    token.asset
  );
}

const processEthereumDeposits = async () => {
  try {
    if (tokenMap.size === 0) {
      console.log(
        "ETHEREUM DEPOSIT PROCESSOR: No tokens configured"
      );
      return;
    }

    const latestBlock =
      await provider.getBlockNumber();

    const result = await pool.query(
      `SELECT
         id,
         block_number,
         token_contract,
         from_address,
         amount,
         status
       FROM blockchain_deposits
       WHERE network = 'ethereum'
       AND status IN ('detected', 'confirmed')
         AND block_number <= $1
       ORDER BY block_number ASC, id ASC
       LIMIT 50`,
      [
        latestBlock - confirmations,
      ]
    );

    if (result.rows.length === 0) {
      return;
    }

    for (const deposit of result.rows) {
      try {
        const asset = tokenMap.get(
          deposit.token_contract.toLowerCase()
        );

        if (!asset) {
          console.error(
            "UNKNOWN TOKEN CONTRACT:",
            deposit.token_contract
          );
          continue;
        }

        const tokenContract =
          new ethers.Contract(
            deposit.token_contract,
            TRANSFER_ABI,
            provider
          );

        const decimals =
          await tokenContract.decimals();

        const amount =
          ethers.formatUnits(
            deposit.amount,
            decimals
          );

       if (deposit.status === "detected") {
  const confirmResult =
    await pool.query(
      `UPDATE blockchain_deposits
       SET
         status = 'confirmed',
         confirmed_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND status = 'detected'
       RETURNING id`,
      [deposit.id]
    );

  if (confirmResult.rows.length === 0) {
    continue;
  }

  console.log(
    "DEPOSIT CONFIRMED:",
    {
      id: deposit.id,
      asset,
      amount,
      block: deposit.block_number,
    }
  );
}

if (deposit.status === "confirmed") {
  console.log(
    "DEPOSIT ALREADY CONFIRMED - PROCESSING CREDIT:",
    {
      id: deposit.id,
      asset,
      amount,
    }
  );
}

        const creditResult =
          await creditConfirmedDeposit({
            blockchainDepositId: deposit.id,
            asset,
            amount,
            fromAddress:
              deposit.from_address,
          });

        console.log(
          "DEPOSIT AUTOMATICALLY PROCESSED:",
          creditResult
        );
      } catch (err) {
        console.error(
          "ETHEREUM DEPOSIT PROCESSOR EVENT ERROR:",
          {
            depositId: deposit.id,
            error: err,
          }
        );
      }
    }
  } catch (err) {
    console.error(
      "ETHEREUM DEPOSIT PROCESSOR ERROR:",
      err
    );
  }
};

module.exports = {
  processEthereumDeposits,
};
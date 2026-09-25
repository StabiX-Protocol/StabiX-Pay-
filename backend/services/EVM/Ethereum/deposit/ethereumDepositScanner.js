const { ethers } = require("ethers");

const { getProvider } = require("../../../blockchainService");
const { getTokenAddress } = require("../../../../config/tokenConfig");
const pool = require("../../../../config/db");

const {
  getScannerState,
  saveScannerState,
} = require("../../../blockchainScannerStateService");

const provider = getProvider();

const TRANSFER_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)",
];

const iface = new ethers.Interface(TRANSFER_ABI);

const CHAIN_ID = Number(
  process.env.ETHEREUM_CHAIN_ID
);

const SCANNER_NAME =
  "ethereum_usdc_usdt_deposit";

const confirmations = Number(
  process.env.BLOCKCHAIN_CONFIRMATIONS || 3
);

const tokens = [
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
].filter(
  (token) => token.address
);

const tokenContracts = new Map();

for (const token of tokens) {
  tokenContracts.set(
    token.address.toLowerCase(),
    token.asset
  );
}

const getDepositAddresses = async () => {
  const result = await pool.query(
    `SELECT
       id,
       user_id,
       network,
       chain_id,
       address
     FROM deposit_addresses
     WHERE network = 'ethereum'
       AND status = 'active'`
  );

  return result.rows;
};

const scanEthereumDeposits = async () => {
  if (tokens.length === 0) {
    throw new Error(
      "No Ethereum token contracts configured"
    );
  }

  const latestBlock =
    await provider.getBlockNumber();

  let state = await getScannerState(
    "ethereum",
    CHAIN_ID,
    SCANNER_NAME
  );

  if (!state) {
    const startBlock =
      Math.max(
        0,
        latestBlock - 20
      );

    state = await saveScannerState(
      "ethereum",
      CHAIN_ID,
      SCANNER_NAME,
      startBlock - 1
    );

    console.log(
      "Ethereum deposit scanner initialized:",
      startBlock
    );
  }

  const fromBlock =
    Number(state.last_scanned_block) + 1;

  if (fromBlock > latestBlock) {
    return;
  }

  const depositAddresses =
    await getDepositAddresses();

  if (depositAddresses.length === 0) {
    await saveScannerState(
      "ethereum",
      CHAIN_ID,
      SCANNER_NAME,
      latestBlock
    );

    return;
  }

  const addressMap = new Map();

  for (const row of depositAddresses) {
    addressMap.set(
      row.address.toLowerCase(),
      row
    );
  }

  const filter = {
    address: tokens.map(
      (token) => token.address
    ),
    topics: [
      ethers.id(
        "Transfer(address,address,uint256)"
      ),
    ],
  };

  const MAX_BLOCK_RANGE = 10;

for (
  let chunkStart = fromBlock;
  chunkStart <= latestBlock;
  chunkStart += MAX_BLOCK_RANGE
) {
  const chunkEnd = Math.min(
    chunkStart + MAX_BLOCK_RANGE - 1,
    latestBlock
  );

  const logs = await provider.getLogs({
    ...filter,
    fromBlock: chunkStart,
    toBlock: chunkEnd,
  });

  for (const log of logs) {
    try {
      if (log.removed) {
        continue;
      }

      const parsed = iface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (!parsed) {
        continue;
      }

      const fromAddress = parsed.args[0];
      const toAddress = parsed.args[1];
      const rawAmount = parsed.args[2];

      const depositAddress =
        addressMap.get(
          toAddress.toLowerCase()
        );

      if (!depositAddress) {
        continue;
      }

      const asset =
        tokenContracts.get(
          log.address.toLowerCase()
        );

      if (!asset) {
        continue;
      }

      const tokenContract =
        new ethers.Contract(
          log.address,
          TRANSFER_ABI,
          provider
        );

      const decimals =
        await tokenContract.decimals();

      const amount =
        ethers.formatUnits(
          rawAmount,
          decimals
        );

      const eventIndex = log.index;

      const insertResult =
        await pool.query(
          `INSERT INTO blockchain_deposits (
             network,
             chain_id,
             tx_hash,
             block_number,
             event_index,
             token_contract,
             from_address,
             to_address,
             amount,
             deposit_address_id,
             status
           )
           VALUES (
             $1,
             $2,
             $3,
             $4,
             $5,
             $6,
             $7,
             $8,
             $9,
             $10,
             'detected'
           )
           ON CONFLICT (
             network,
             tx_hash,
             event_index
           )
           DO NOTHING
           RETURNING id`,
          [
            "ethereum",
            CHAIN_ID,
            log.transactionHash,
            log.blockNumber,
            eventIndex,
            log.address,
            fromAddress,
            toAddress,
            rawAmount.toString(),
            depositAddress.id,
          ]
        );

      if (insertResult.rows.length === 0) {
        continue;
      }

      console.log(
        "RECOVERY DEPOSIT DETECTED:",
        {
          asset,
          amount,
          txHash: log.transactionHash,
          depositAddressId:
            depositAddress.id,
        }
      );
    } catch (err) {
      console.error(
        "ETHEREUM DEPOSIT SCAN EVENT ERROR:",
        err
      );
    }
  }
}

  await saveScannerState(
    "ethereum",
    CHAIN_ID,
    SCANNER_NAME,
    latestBlock
  );

  console.log(
    `Ethereum deposit scanner processed blocks ${fromBlock} → ${latestBlock}`
  );
};

module.exports = {
  scanEthereumDeposits,
};
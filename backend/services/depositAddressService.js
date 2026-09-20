const pool = require("../config/db");
const { generateDepositWallet } = require("./walletService");

const getOrCreateDepositAddress = async (
  userId,
  network,
  mode = "instant"
) => {
    const existing = await pool.query(
    `SELECT
       id,
       user_id,
       network,
       chain_id,
       address,
       status,
       key_reference,
       derivation_index
     FROM deposit_addresses
   WHERE user_id = $1
  AND network = $2
  AND mode = $3
  AND status = 'active'
     LIMIT 1`,
    [userId, network, mode]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

const sequenceMap = {
  ethereum: "deposit_address_ethereum_index_seq",
  arbitrum: "deposit_address_arbitrum_index_seq",
  bnb: "deposit_address_bnb_index_seq",
  tron: "deposit_address_tron_index_seq",
};
const sequenceName = sequenceMap[network];
if (!sequenceName) {
  throw new Error(`Unsupported deposit network: ${network}`);
}
const indexResult = await pool.query(
  `SELECT nextval('${sequenceName}') AS next_index`
);

const derivationIndex = Number(
  indexResult.rows[0].next_index
);

  const wallet = generateDepositWallet(
  network,
  derivationIndex
);

if (
  network === "evm" &&
  process.env.EVM_DEPOSIT_WALLET_ADDRESS &&
  wallet.address.toLowerCase() ===
    process.env.EVM_DEPOSIT_WALLET_ADDRESS.toLowerCase()
) {
  throw new Error(
    "Derived deposit address matches master wallet address"
  );
}

const chainIds = {
  ethereum: Number(process.env.ETHEREUM_CHAIN_ID),
  arbitrum: Number(process.env.ARBITRUM_CHAIN_ID),
  bnb: Number(process.env.BNB_CHAIN_ID),
  tron: null,
};
const chainId = chainIds[network];
if (
  chainId === undefined
) {
  throw new Error(
    `Unsupported deposit network: ${network}`
  );
}

  const result = await pool.query(
    `INSERT INTO deposit_addresses (
   user_id,
   network,
   mode,
   chain_id,
   address,
   status,
   key_reference,
   derivation_index
)
VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)
     RETURNING
       id,
       user_id,
       network,
       mode,
       chain_id,
       address,
       status,
       key_reference,
       derivation_index`,
    [
      userId,
      network,
      chainId,
      wallet.address,
      wallet.keyReference,
      wallet.derivationIndex,
    ]
  );

  return result.rows[0];
};

module.exports = {
  getOrCreateDepositAddress,
};
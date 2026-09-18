const pool = require("../config/db");
const { generateDepositWallet } = require("./walletService");

const getOrCreateDepositAddress = async (userId, network) => {
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
       AND status = 'active'
     LIMIT 1`,
    [userId, network]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

 const indexResult = await pool.query(
  `SELECT nextval('deposit_address_evm_index_seq') AS next_index`
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

const chainId =
  network === "evm"
    ? Number(process.env.BLOCKCHAIN_CHAIN_ID)
    : null;

  const result = await pool.query(
    `INSERT INTO deposit_addresses (
       user_id,
       network,
       chain_id,
       address,
       status,
       key_reference,
       derivation_index
     )
     VALUES ($1, $2, $3, $4, 'active', $5, $6)
     RETURNING
       id,
       user_id,
       network,
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
const pool = require("../config/db");

const createSweepJob = async ({
  network,
  chainId,
  asset,
  tokenContract,
  depositAddressId,
  sourceAddress,
  destinationAddress,
  amount,
}) => {
  const result = await pool.query(
    `INSERT INTO sweep_jobs (
       network,
       chain_id,
       asset,
       token_contract,
       deposit_address_id,
       source_address,
       destination_address,
       amount,
       status,
       next_attempt_at
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
       'queued',
       CURRENT_TIMESTAMP
     )
     ON CONFLICT DO NOTHING
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
       attempts,
       tx_hash,
       created_at,
       updated_at,
       broadcast_at,
       confirmed_at,
       next_attempt_at`,
    [
      network,
      chainId,
      asset,
      tokenContract,
      depositAddressId,
      sourceAddress,
      destinationAddress,
      amount,
    ]
  );

  return result.rows[0] || null;
};

const getPendingSweepJobs = async (limit = 20) => {
  const result = await pool.query(
    `SELECT
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
       attempts,
       tx_hash,
       last_error,
       created_at,
       updated_at,
       broadcast_at,
       confirmed_at,
       next_attempt_at
     FROM sweep_jobs
     WHERE status IN ('queued','broadcast')
       AND (
         next_attempt_at IS NULL
         OR next_attempt_at <= CURRENT_TIMESTAMP
       )
     ORDER BY created_at ASC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

module.exports = {
  createSweepJob,
  getPendingSweepJobs,
};
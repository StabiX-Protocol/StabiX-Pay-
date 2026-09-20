const pool = require("../config/db");

const getScannerState = async (
  network,
  chainId,
  scannerName
) => {
  const result = await pool.query(
    `SELECT
       id,
       network,
       chain_id,
       scanner_name,
       last_scanned_block,
       updated_at
     FROM blockchain_scanner_state
     WHERE network = $1
       AND chain_id = $2
       AND scanner_name = $3
     LIMIT 1`,
    [
      network,
      chainId,
      scannerName,
    ]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

const saveScannerState = async (
  network,
  chainId,
  scannerName,
  lastScannedBlock
) => {
  const result = await pool.query(
    `INSERT INTO blockchain_scanner_state
     (
       network,
       chain_id,
       scanner_name,
       last_scanned_block,
       updated_at
     )
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)

     ON CONFLICT (
       network,
       chain_id,
       scanner_name
     )

     DO UPDATE SET
       last_scanned_block = EXCLUDED.last_scanned_block,
       updated_at = CURRENT_TIMESTAMP

     RETURNING
       id,
       network,
       chain_id,
       scanner_name,
       last_scanned_block,
       updated_at`,
    [
      network,
      chainId,
      scannerName,
      lastScannedBlock,
    ]
  );

  return result.rows[0];
};

module.exports = {
  getScannerState,
  saveScannerState,
};
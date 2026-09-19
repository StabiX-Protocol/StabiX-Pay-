const pool = require("../config/db");

const creditConfirmedDeposit = async ({
  blockchainDepositId,
  asset,
  amount,
  fromAddress,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lock blockchain deposit row
    const depositResult = await client.query(
      `SELECT
  id,
  network,
  tx_hash,
  event_index,
  deposit_address_id,
  from_address,
  to_address,
  status,
  credited_at
       FROM blockchain_deposits
       WHERE id = $1
       FOR UPDATE`,
      [blockchainDepositId]
    );

    if (depositResult.rows.length === 0) {
      throw new Error("Blockchain deposit not found");
    }

    const deposit = depositResult.rows[0];

    // 2. Already credited = nothing to do
    if (deposit.status === "credited") {
      await client.query("COMMIT");

      return {
        success: true,
        alreadyCredited: true,
      };
    }

    // 3. Only confirmed deposits can be credited
    if (deposit.status !== "confirmed") {
      throw new Error(
        `Deposit is not confirmed. Current status: ${deposit.status}`
      );
    }

    // 4. Find the user through deposit address
    const userResult = await client.query(
      `SELECT
         da.user_id,
         u.stbx_uid
       FROM deposit_addresses da
       INNER JOIN users u
         ON u.id = da.user_id
       WHERE da.id = $1
       LIMIT 1`,
      [deposit.deposit_address_id]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User for deposit address not found");
    }

    const stbx_uid = userResult.rows[0].stbx_uid;

    // 5. Validate asset
    if (!["USDT", "USDC"].includes(asset)) {
      throw new Error(`Unsupported asset: ${asset}`);
    }

   // 6. Unique idempotency key for this blockchain event
    const idempotencyKey =
      `deposit:${deposit.network}:` +
      `${deposit.tx_hash}:${deposit.event_index}`;

    // 7. Check if this blockchain deposit was already processed
    const existingTransaction = await client.query(
      `SELECT
         str_id,
         receiver_stbx_uid,
         asset,
         amount
       FROM transactions
       WHERE idempotency_key = $1
       LIMIT 1`,
      [idempotencyKey]
    );

    if (existingTransaction.rows.length > 0) {
      await client.query(
        `UPDATE blockchain_deposits
         SET
           status = 'credited',
           credited_at = COALESCE(
             credited_at,
             CURRENT_TIMESTAMP
           )
         WHERE id = $1`,
        [blockchainDepositId]
      );

      await client.query("COMMIT");

      return {
        success: true,
        alreadyCredited: true,
        stbx_uid: existingTransaction.rows[0].receiver_stbx_uid,
        asset: existingTransaction.rows[0].asset,
        amount: String(existingTransaction.rows[0].amount),
        STRId: existingTransaction.rows[0].str_id,
      };
    }

    // 8. Create wallet balance row if it does not exist
    await client.query(
      `INSERT INTO wallet_balances
       (stbx_uid, asset, balance)
       VALUES ($1, $2, 0)
       ON CONFLICT (stbx_uid, asset)
       DO NOTHING`,
      [stbx_uid, asset]
    );

    // 9. Credit user balance
    const balanceResult = await client.query(
      `UPDATE wallet_balances
       SET
         balance = balance + $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE stbx_uid = $2
         AND asset = $3
       RETURNING balance`,
      [String(amount), stbx_uid, asset]
    );

    if (balanceResult.rows.length === 0) {
      throw new Error("Unable to credit wallet balance");
    }

    // 10. Create StabiX transaction
    const STRId =
      "STR" +
      Date.now() +
      Math.floor(Math.random() * 1000);

    await client.query(
      `INSERT INTO transactions
       (
         str_id,
         sender_stbx_uid,
         receiver_stbx_uid,
         asset,
         amount,
         tx_type,
         status,
         note,
         blockchain_tx_hash,
         idempotency_key,
         blockchain_from_address
       )
       VALUES
       (
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
         $11
       )`,
      [
        STRId,
        "STBX-SYSTEM",
        stbx_uid,
        asset,
        String(amount),
        "DEPOSIT",
        "SUCCESS",
        "Automated blockchain deposit",
        deposit.tx_hash,
        idempotencyKey,
        fromAddress,
      ]
    );

    // 11. Mark blockchain deposit as credited
    await client.query(
      `UPDATE blockchain_deposits
       SET
         status = 'credited',
         credited_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [blockchainDepositId]
    );

    
    await client.query("COMMIT");

    return {
      success: true,
      alreadyCredited: false,
      stbx_uid,
      asset,
      amount: String(amount),
      STRId,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  creditConfirmedDeposit,
};
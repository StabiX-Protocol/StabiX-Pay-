const pool = require("../config/db");
const { ethers } = require("ethers");

const SUPPORTED_ASSETS = ["USDT", "USDC"];

const SUPPORTED_MODES = [
  "instant",
  "advanced",
];

const SUPPORTED_NETWORKS = [
  "ethereum",
  "arbitrum",
  "bnb",
  "tron",
];

const isValidAmount = (amount) => {
  if (
    typeof amount !== "string" &&
    typeof amount !== "number"
  ) {
    return false;
  }

  const value = String(amount).trim();

  if (!/^\d+(\.\d+)?$/.test(value)) {
    return false;
  }

  return Number(value) > 0;
};

const isValidEvmAddress = (address) => {
  return (
    typeof address === "string" &&
    ethers.isAddress(address)
  );
};

const createWithdraw = async (req, res) => {
  const stbx_uid = req.user.stbx_uid;

  const {
    asset,
    mode,
    network,
    amount,
    destination_address,
  } = req.body;

  if (!SUPPORTED_ASSETS.includes(asset)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported asset",
    });
  }

  if (!SUPPORTED_MODES.includes(mode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid withdraw mode",
    });
  }

  if (!SUPPORTED_NETWORKS.includes(network)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported network",
    });
  }

  if (!isValidAmount(amount)) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount",
    });
  }

  if (
    typeof destination_address !== "string" ||
    destination_address.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Destination address is required",
    });
  }

  /*
   * Current blockchain withdrawal implementation
   * starts with EVM networks.
   *
   * TRON validation/execution will be handled by
   * the TRON withdrawal worker.
   */
  if (
    network !== "tron" &&
    !isValidEvmAddress(destination_address)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid destination address",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * Verify authenticated user.
     */
    const userResult = await client.query(
      `SELECT
         id,
         stbx_uid
       FROM users
       WHERE stbx_uid = $1
       LIMIT 1`,
      [stbx_uid]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = userResult.rows[0].id;

const feeResult = await client.query(
  `SELECT
     fee
   FROM withdrawal_fees
   WHERE asset = $1
     AND network = $2
     AND mode = $3
     AND active = TRUE
   LIMIT 1
   FOR UPDATE`,
  [
    asset,
    network,
    mode,
  ]
);

if (feeResult.rows.length === 0) {
  await client.query("ROLLBACK");

  return res.status(400).json({
    success: false,
    message: "Withdrawal fee configuration not available",
  });
}

const fee = feeResult.rows[0].fee;

if (Number(amount) <= Number(fee)) {
  await client.query("ROLLBACK");

  return res.status(400).json({
    success: false,
    message: "Withdrawal amount must be greater than withdrawal fee",
  });
}

const balanceResult = await client.query(
      `UPDATE wallet_balances
       SET
         balance = balance - $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE stbx_uid = $2
         AND asset = $3
         AND balance >= $1
       RETURNING
         balance`,
      [
        amount,
        stbx_uid,
        asset,
      ]
    );

    if (balanceResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    /*
     * Create withdrawal request.
     *
     * Blockchain execution is NOT performed here.
     * A separate withdrawal worker will process it.
     */
    const STRId =
"STR" +
Date.now() +
Math.floor(Math.random() * 1000);

    const withdrawalResult = await client.query(
      `INSERT INTO withdrawals (
         "STRId",
         user_id,
         stbx_uid,
         asset,
         amount,
         network,
         mode,
         destination_address,
         fee,
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
         'pending'
       )
       RETURNING
         id,
         "STRId",
         stbx_uid,
         asset,
         amount,
         network,
         mode,
         destination_address,
         fee,
         status,
         blockchain_tx_hash,
         created_at`,
      [
        STRId,
        userId,
        stbx_uid,
        asset,
        amount,
        network,
        mode,
        destination_address.trim(),
        fee,
      ]
    );

    const withdrawal =
      withdrawalResult.rows[0];

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Withdraw request created",
      withdrawal,
    });

  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Withdraw rollback failed:",
        rollbackError
      );
    }

    console.error(
      "CREATE WITHDRAW ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  } finally {
    client.release();
  }
};

const getWithdrawFee = async (req, res) => {
  try {
    const { asset, network, mode } = req.query;

    if (!SUPPORTED_ASSETS.includes(asset)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported asset",
      });
    }

    if (!SUPPORTED_MODES.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdraw mode",
      });
    }

    if (!SUPPORTED_NETWORKS.includes(network)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported network",
      });
    }

    const result = await pool.query(
      `SELECT fee
       FROM withdrawal_fees
       WHERE asset = $1
         AND network = $2
         AND mode = $3
         AND active = TRUE
       LIMIT 1`,
      [
        asset,
        network,
        mode,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal fee configuration not available",
      });
    }

    return res.status(200).json({
      success: true,
      asset,
      network,
      mode,
      fee: result.rows[0].fee,
    });

  } catch (err) {
    console.error(
      "GET WITHDRAW FEE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get withdrawal fee",
    });
  }
};


const getWithdrawHistory = async (req, res) => {
  try {
    const stbx_uid = req.user.stbx_uid;

    const result = await pool.query(
      `SELECT
         id,
         STRId,
         stbx_uid,
         asset,
         amount,
         network,
         mode,
         destination_address,
         fee,
         status,
         blockchain_tx_hash,
         error_message,
         created_at,
         updated_at,
         broadcast_at,
         confirmed_at
       FROM withdrawals
       WHERE stbx_uid = $1
       ORDER BY created_at DESC`,
      [stbx_uid]
    );

    return res.status(200).json({
      success: true,
      withdrawals: result.rows,
    });

  } catch (err) {
    console.error(
      "GET WITHDRAW HISTORY ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const getWithdrawById = async (req, res) => {
  try {
    const { id } = req.params;
    const stbx_uid = req.user.stbx_uid;

    const result = await pool.query(
      `SELECT
         id,
         STRId,
         stbx_uid,
         asset,
         amount,
         network,
         mode,
         destination_address,
         fee,
         status,
         blockchain_tx_hash,
         error_message,
         created_at,
         updated_at,
         broadcast_at,
         confirmed_at
       FROM withdrawals
       WHERE id = $1
         AND stbx_uid = $2
       LIMIT 1`,
      [
        id,
        stbx_uid,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Withdraw not found",
      });
    }

    return res.status(200).json({
      success: true,
      withdrawal: result.rows[0],
    });

  } catch (err) {
    console.error(
      "GET WITHDRAW ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


module.exports = {
  createWithdraw,
  getWithdrawHistory,
  getWithdrawById,
  getWithdrawFee,
};
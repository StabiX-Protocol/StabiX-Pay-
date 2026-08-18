const pool = require("../config/db");

const createWithdraw = async (req, res) => {

  const {
    stbx_uid,
    asset,
    mode,
    network,
    amount,
    wallet_address
  } = req.body;

  const client = await pool.connect();

  try {

    const user = await client.query(
      "SELECT stbx_uid FROM users WHERE stbx_uid = $1",
      [stbx_uid]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!["USDT", "USDC"].includes(asset)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported asset"
      });
    }

    if (!["instant", "advanced"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdraw mode"
      });
    }

    if (![
  "Ethereum (Testnet)",
  "Arbitrum (Testnet)",
  "Polygon (Testnet)",
  "Base (Testnet)",
  "Tron (Testnet)",
  "Ethereum (Sepolia)",
  "Arbitrum (Sepolia)",
  "Polygon (Amoy)",
  "Base (Sepolia)",
  "Tron (Nile Testnet)"
].includes(network)) {
  return res.status(400).json({
    success: false,
    message: "Unsupported network"
  });
}

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    if (
      typeof wallet_address !== "string" ||
      !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
      });
    }

    await client.query("BEGIN");

    const balance = await client.query(
      `SELECT balance
       FROM wallet_balances
       WHERE stbx_uid = $1
       AND asset = $2
       FOR UPDATE`,
      [stbx_uid, asset]
    );

    if (balance.rows.length === 0) {

      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Wallet balance not found"
      });

    }

    const currentBalance = Number(balance.rows[0].balance);
    const withdrawAmount = Number(amount);

    if (currentBalance < withdrawAmount) {

      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });

    }

    const STRId =
      "STR" +
      Date.now() +
      Math.floor(Math.random() * 1000);

    await client.query(
      `INSERT INTO withdraws
      (
        "STRId",
        stbx_uid,
        asset,
        mode,
        network,
        amount,
        wallet_address,
        status
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8
      )`,
      [
        STRId,
        stbx_uid,
        asset,
        mode,
        network,
        withdrawAmount,
        wallet_address,
        "PENDING"
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Withdraw request submitted.",
      STRId
    });

  } catch (err) {

    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Withdraw rollback failed:", rollbackErr);
    }

    console.error("Withdraw error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  } finally {

    client.release();

  }
};

const getWithdrawHistory = async (req, res) => {
try {
const { stbx_uid } = req.params;

const result = await pool.query(
`SELECT
STRId,
asset,
mode,
network,
amount,
wallet_address,
status,
created_at
FROM withdraws
WHERE stbx_uid = $1
ORDER BY created_at DESC`,
[stbx_uid]
);

return res.status(200).json({
success: true,
withdraws: result.rows
});

} catch (err) {
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};


const getWithdrawById = async (req, res) => {
try {
const { STRId } = req.params;

const result = await pool.query(
`SELECT *
FROM withdraws
WHERE STRId = $1`,
[STRId]
);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Withdraw not found"
      });
    }

    return res.status(200).json({
      success: true,
      withdraw: result.rows[0]
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports = {
createWithdraw,
getWithdrawHistory,
getWithdrawById
};
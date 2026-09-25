const pool = require("../config/db");

const getWithdrawalFeeRevenue = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        withdrawal_id,
        "STRId",
        stbx_uid,
        asset,
        network,
        mode,
        fee,
        blockchain_tx_hash,
        status,
        created_at
      FROM withdrawal_fee_revenue
      ORDER BY created_at DESC
      LIMIT 100
      `
    );

    return res.status(200).json({
      success: true,
      revenue: result.rows,
    });
  } catch (err) {
    console.error("ADMIN REVENUE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load withdrawal fee revenue",
    });
  }
};

const getWithdrawalFeeRevenueSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*) AS total_withdrawals,
        COALESCE(
          SUM(fee) FILTER (WHERE asset = 'USDC'),
          0
        ) AS total_usdc_fee,
        COALESCE(
          SUM(fee) FILTER (WHERE asset = 'USDT'),
          0
        ) AS total_usdt_fee
      FROM withdrawal_fee_revenue
      WHERE status = 'collected'
      `
    );

    return res.status(200).json({
      success: true,
      summary: result.rows[0],
    });
  } catch (err) {
    console.error(
      "ADMIN REVENUE SUMMARY ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load revenue summary",
    });
  }
};

module.exports = {
  getWithdrawalFeeRevenue,
  getWithdrawalFeeRevenueSummary,
};
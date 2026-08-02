const pool = require("../config/db");

const getBalance = async (req, res) => {
  try {

    const { stbx_uid } = req.params;

    const result = await pool.query(
  `SELECT
      asset,
      balance
   FROM wallet_balances
   WHERE stbx_uid = $1
   ORDER BY asset`,
  [stbx_uid]
);

if (result.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: "Balance not found"
  });
}

return res.status(200).json({
  success: true,
  balances: result.rows
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
  getBalance
};

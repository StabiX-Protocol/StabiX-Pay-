const pool = require("../config/db");

const sendTransaction = async (req, res) => {
  try {

    const {
      sender_stbx_uid,
      receiver_stbx_uid,
      asset,
      amount,
      note
    } = req.body;

    const sender = await pool.query(
  "SELECT stbx_uid FROM users WHERE stbx_uid = $1",
  [sender_stbx_uid]
);

if (sender.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: "Sender not found"
  });
}

const receiver = await pool.query(
  "SELECT stbx_uid FROM users WHERE stbx_uid = $1",
  [receiver_stbx_uid]
);

if (receiver.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: "Receiver not found"
  });
}

const STRId =
  "STR" +
  Date.now() +
  Math.floor(Math.random() * 1000);

await pool.query(
  `INSERT INTO transactions
  (
    tx_id,
    sender_stbx_uid,
    receiver_stbx_uid,
    asset,
    amount,
    tx_type,
    status,
    note
  )
  VALUES
  (
    $1,$2,$3,$4,$5,$6,$7,$8
  )`,
  [
    STRId,
    sender_stbx_uid,
    receiver_stbx_uid,
    asset,
    amount,
    "SEND",
    "SUCCESS",
    note || null
  ]
);

return res.status(200).json({
  success: true,
  message: "Transaction completed successfully.",
  STR_id: STRId
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
  sendTransaction
};
const pool = require("../config/db");

const {
processTransaction
} = require("../services/transactionService");

const sendTransaction = async (req, res) => {

const client = await pool.connect();
try {
await client.query("BEGIN");

const {
sender_stbx_uid,
receiver_stbx_uid,
asset,
amount,
note
} = req.body;

const sender = await client.query(
"SELECT stbx_uid FROM users WHERE stbx_uid = $1",
[sender_stbx_uid]
);

if (sender.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Sender not found"
});
}

const senderBalance = await client.query(
`SELECT balance
FROM wallet_balances
WHERE stbx_uid = $1
AND asset = $2`,
[sender_stbx_uid, asset]
);

if (senderBalance.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Sender wallet balance not found"
});
}

const currentBalance = Number(senderBalance.rows[0].balance);
if (currentBalance < Number(amount)) {
return res.status(400).json({
success: false,
message: "Insufficient balance"
});
}

const receiver = await client.query(
"SELECT stbx_uid FROM users WHERE stbx_uid = $1",
[receiver_stbx_uid]
);

if (receiver.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Receiver not found"
});
}

const STRId = await processTransaction(
client,
sender_stbx_uid,
receiver_stbx_uid,
asset,
amount,
note
);

await client.query("COMMIT");
return res.status(200).json({
success: true,
message: "Transaction completed successfully.",
STR_id: STRId
});
} catch (err) {
await client.query("ROLLBACK");
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});
} finally {
client.release();
}
};

const getTransactionHistory = async (req, res) => {
try {
const { stbx_uid } = req.params;
const result = await pool.query(
`SELECT
tx_id,
sender_stbx_uid,
receiver_stbx_uid,
asset,
amount,
tx_type,
status,
note,
blockchain_tx_hash,
created_at
FROM transactions
WHERE sender_stbx_uid = $1
OR receiver_stbx_uid = $1
ORDER BY created_at DESC`,
[stbx_uid]
);

return res.status(200).json({
success: true,
transactions: result.rows
});
} catch (err) {
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};

const getTransactionBySTRId = async (req, res) => {
try {
const { str_id } = req.params;

const result = await pool.query(
`SELECT
tx_id,
sender_stbx_uid,
receiver_stbx_uid,
asset,
amount,
tx_type,
status,
note,
blockchain_tx_hash,
created_at,
updated_at
FROM transactions
WHERE tx_id = $1`,
[str_id]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Transaction not found"
});
}

return res.status(200).json({
success: true,
transaction: result.rows[0]
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
sendTransaction,
getTransactionHistory,
getTransactionBySTRId
};
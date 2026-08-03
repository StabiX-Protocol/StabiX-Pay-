const pool = require("../config/db");

const createWithdraw = async (req, res) => {

const client = await pool.connect();
try {
await client.query("BEGIN");

const {
stbx_uid,
asset,
amount,
wallet_address
} = req.body;

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

const balance = await client.query(
`SELECT balance
FROM wallet_balances
WHERE stbx_uid = $1
AND asset = $2`,
[stbx_uid, asset]
);

if (balance.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Wallet balance not found"
});
}

const currentBalance = Number(balance.rows[0].balance);
if (currentBalance < Number(amount)) {
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
STRId,
stbx_uid,
asset,
amount,
wallet_address,
status
)
VALUES
(
$1,$2,$3,$4,$5,$6
)`,
[
STRId,
stbx_uid,
asset,
amount,
wallet_address,
"PENDING"
]
);

await client.query("COMMIT");
return res.status(201).json({
success: true,
message: "Withdraw request submitted.",
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

module.exports = {
createWithdraw
};
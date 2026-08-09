const pool = require("../config/db");

const createDeposit = async (req, res) => {

const client = await pool.connect();
try {
await client.query("BEGIN");

const {
stbx_uid,
asset,
mode,
network,
amount,
blockchain_tx_hash
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

if (!["USDT", "USDC"].includes(asset)) {
return res.status(400).json({
success: false,
message: "Unsupported asset"
});
}

if (!["instant", "advanced"].includes(mode)) {
return res.status(400).json({
success: false,
message: "Invalid deposit mode"
});
}

if (![
"Ethereum (Testnet)",
"Arbitrum (Testnet)",
"Polygon (Testnet)",
"Base (Testnet)",
"Tron (Testnet)"
].includes(network)) {
return res.status(400).json({
success: false,
message: "Unsupported network"
});
}

const STRId =
"STR" +
Date.now() +
Math.floor(Math.random() * 1000);

await client.query(
`INSERT INTO deposits
(
STRId,
stbx_uid,
asset,
mode,
network,
amount,
blockchain_tx_hash,
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
amount,
blockchain_tx_hash,
"PENDING"
]
);

await client.query("COMMIT");
return res.status(201).json({
success: true,
message: "Deposit request submitted.",
STRId: STRId
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

const getDepositHistory = async (req, res) => {
try {
const { stbx_uid } = req.params;

const result = await pool.query(
`SELECT
STRId,
asset,
mode,
network,
amount,
blockchain_tx_hash,
status,
created_at
FROM deposits
WHERE stbx_uid = $1
ORDER BY created_at DESC`,
[stbx_uid]
);

return res.status(200).json({
success: true,
deposits: result.rows
});

} catch (err) {
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};

const getDepositById = async (req, res) => {
try {
const { STRId } = req.params;

const result = await pool.query(
`SELECT *
FROM deposits
WHERE STRId = $1`,
[STRId]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Deposit not found"
});
}

return res.status(200).json({
success: true,
deposit: result.rows[0]
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
createDeposit,
getDepositHistory,
getDepositById,
};
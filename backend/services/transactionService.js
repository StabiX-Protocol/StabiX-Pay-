
const { debitBalance, creditBalance } = require("../controllers/balanceController");

const processTransaction = async (
client,
sender_stbx_uid,
receiver_stbx_uid,
asset,
amount,
note
) => {

await debitBalance(
client,
sender_stbx_uid,
asset,
amount
);

await client.query(
`INSERT INTO wallet_balances
(stbx_uid, asset, balance)
VALUES ($1,$2,0)
ON CONFLICT (stbx_uid, asset)
DO NOTHING`,
[
receiver_stbx_uid,
asset
]
);

await creditBalance(
client,
receiver_stbx_uid,
asset,
amount
);

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
return STRId;
};

module.exports = {
processTransaction
};
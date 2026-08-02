const pool = require("../config/db");

const {
  debitBalance,
  creditBalance
} = require("../controllers/balanceController");

const processTransaction = async (
  client,
  sender_stbx_uid,
  receiver_stbx_uid,
  asset,
  amount,
  note
) => {

  const transaction = {
    sender_stbx_uid,
    receiver_stbx_uid,
    asset,
    amount,
    note
  };

await debitBalance(
  client,
  sender_stbx_uid,
  asset,
  amount
);

await creditBalance(
  client,
  receiver_stbx_uid,
  asset,
  amount
);
};
module.exports = {processTransaction};


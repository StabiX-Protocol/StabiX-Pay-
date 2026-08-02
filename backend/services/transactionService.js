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
};
module.exports = {processTransaction};


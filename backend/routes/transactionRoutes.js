const express = require("express");
const router = express.Router();

const {
  sendTransaction,
  getTransactionHistory
} = require("../controllers/transactionController");

router.post("/send", sendTransaction);
router.get("/history/:stbx_uid", getTransactionHistory);

module.exports = router;
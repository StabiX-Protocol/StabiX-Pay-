const express = require("express");
const router = express.Router();

const {
  sendTransaction,
  getTransactionHistory,
  getTransactionBySTRId
} = require("../controllers/transactionController");

router.post("/send", sendTransaction);
router.get("/history/:stbx_uid", getTransactionHistory);
router.get("/:str_id", getTransactionBySTRId);

module.exports = router;
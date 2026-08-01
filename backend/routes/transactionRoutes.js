const express = require("express");
const router = express.Router();

const {
  sendTransaction
} = require("../controllers/transactionController");

router.post("/send", sendTransaction);

module.exports = router;
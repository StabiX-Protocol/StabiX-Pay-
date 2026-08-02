const express = require("express");

const router = express.Router();

const {
  createDeposit,
  getDepositHistory,
  getDepositById
} = require("../controllers/depositController");

router.post("/", createDeposit);

router.get("/history/:stbx_uid", getDepositHistory);

router.get("/:STRId", getDepositById);

module.exports = router;
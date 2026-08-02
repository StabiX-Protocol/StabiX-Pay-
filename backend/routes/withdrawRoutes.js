const express = require("express");

const router = express.Router();

const {
  createWithdraw
} = require("../controllers/withdrawController");

router.post("/", createWithdraw);

module.exports = router;
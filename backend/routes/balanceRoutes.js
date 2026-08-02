const express = require("express");
const router = express.Router();

const {
  getBalance
} = require("../controllers/balanceController");

router.get("/:stbx_uid", getBalance);

module.exports = router;
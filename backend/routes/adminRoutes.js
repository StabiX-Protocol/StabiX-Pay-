const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");

const {
  getWithdrawalFeeRevenue,
  getWithdrawalFeeRevenueSummary,
} = require("../controllers/adminController");

router.get(
  "/revenue/withdrawal-fees",
  verifyToken,
  verifyAdmin,
  getWithdrawalFeeRevenue
);

router.get(
  "/revenue/withdrawal-fees/summary",
  verifyToken,
  verifyAdmin,
  getWithdrawalFeeRevenueSummary
);

module.exports = router;
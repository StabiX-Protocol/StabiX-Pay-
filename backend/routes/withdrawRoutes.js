const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
  createWithdraw,
  getWithdrawHistory,
  getWithdrawById,
  getWithdrawFee,
} = require("../controllers/withdrawController");

router.post(
  "/",
  verifyToken,
  createWithdraw
);

router.get(
  "/history",
  verifyToken,
  getWithdrawHistory
);

router.get(
  "/fee",
  verifyToken,
  getWithdrawFee
);

router.get(
  "/:id",
  verifyToken,
  getWithdrawById
);

module.exports = router;
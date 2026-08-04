const express = require ("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
  approveDeposit,
  rejectDeposit,
  approveWithdraw,
  rejectWithdraw,
  getPendingDeposits
} = require("../controllers/validatorController");

router.patch(
  "/deposit/approve/:STRId",
  verifyToken,
  approveDeposit
);

router.patch(
  "/deposit/reject/:STRId",
  verifyToken,
  rejectDeposit
);

router.get(
  "/deposit/pending",
  verifyToken,
  getPendingDeposits
);

router.patch(
  "/withdraw/approve/:STRId",
  verifyToken,
  approveWithdraw
);

router.patch(
  "/withdraw/reject/:STRId",
  verifyToken,
  rejectWithdraw
);


module.exports = router;

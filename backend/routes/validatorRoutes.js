const express = require ("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { verifyValidator } = require("../middleware/validatorMiddleware");

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
  verifyValidator,
  approveDeposit
);

router.patch(
  "/deposit/reject/:STRId",
  verifyToken,
   verifyValidator,
  rejectDeposit
);

router.get(
  "/deposit/pending",
  verifyToken,
  verifyValidator,
  getPendingDeposits
);

router.patch(
  "/withdraw/approve/:STRId",
  verifyToken,
  verifyValidator,
  approveWithdraw
);

router.patch(
  "/withdraw/reject/:STRId",
  verifyToken,
  verifyValidator,
  rejectWithdraw
);


module.exports = router;

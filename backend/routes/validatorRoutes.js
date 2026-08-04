const express = require ("express");

const router = express.Router();

const {
  approveDeposit,
  rejectDeposit,
  approveWithdraw,
  rejectWithdraw,
  getPendingDeposits
} = require("../controllers/validatorController");

router.patch(
  "/deposit/approve/:STRId",
  approveDeposit
);

router.patch(
  "/deposit/reject/:STRId",
  rejectDeposit
);

router.get(
  "/deposit/pending",
  getPendingDeposits
);

router.patch(
  "/withdraw/approve/:STRId",
  approveWithdraw
);

router.patch(
  "/withdraw/reject/:STRId",
  rejectWithdraw
);


module.exports = router;

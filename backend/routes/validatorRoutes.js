const express = require("express");

const router = express.Router();

const {
  approveDeposit,
  rejectDeposit,
  approveWithdraw
} = require("../controllers/validatorController");

router.patch(
  "/deposit/approve/:STRId",
  approveDeposit
);

router.patch(
  "/deposit/reject/:STRId",
  rejectDeposit
);

router.patch(
  "/withdraw/approve/:STRId",
  approveWithdraw
);

//router.patch(
  //"/withdraw/reject/:STRId",
//);

module.exports = router;

const express = require("express");

const router = express.Router();

const {
  approveDeposit,
  rejectDeposit
} = require("../controllers/validatorController");

router.patch(
  "/deposit/approve/:STRId",
  approveDeposit
);

router.patch(
  "/deposit/reject/:STRId",
  rejectDeposit
);


module.exports = router;

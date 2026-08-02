const express = require("express");

const router = express.Router();

const {
  approveDeposit
} = require("../controllers/validatorController");

router.patch(
  "/deposit/approve/:STRId",
  approveDeposit
);

module.exports = router;

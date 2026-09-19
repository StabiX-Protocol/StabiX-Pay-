const express = require("express");
const router = express.Router();

const {verifyToken} = require("../middleware/authMiddleware");

const {
  createDeposit,
  getDepositAddress,
  getDepositHistory,
  getDepositById,
  createDepositIntent,
  attachDepositIntentAddress
} = require("../controllers/depositController");

const {
  depositValidation
} = require("../validators/transactionValidator");

const {
  validationResult
} = require("express-validator");

const validate = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();

};

router.get(
  "/address",
  verifyToken,
  getDepositAddress
)

router.post(
  "/",
  verifyToken,
  depositValidation,
  validate,
  createDeposit
);

router.get(
  "/history",
  verifyToken,
  getDepositHistory
);

router.get(
  "/:STRId",
  verifyToken,
  getDepositById
);

router.get(
  "/intent",
  verifyToken,
  createDepositIntent
);

router.post(
  "/intent/address",
  verifyToken,
  attachDepositIntentAddress
);



module.exports = router;
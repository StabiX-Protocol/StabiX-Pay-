const express = require("express");
const router = express.Router();

const {verifyToken} = require("../middleware/authMiddleware");

const {
  createDeposit,
  getDepositHistory,
  getDepositById
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

router.post(
  "/",
  verifyToken,
  depositValidation,
  validate,
  createDeposit
);

router.get(
  "/history/:stbx_uid",
  verifyToken,
  getDepositHistory
);

router.get(
  "/:STRId",
  verifyToken,
  getDepositById
);


module.exports = router;
const express = require("express");

const router = express.Router();

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

router.post("/", depositValidation,validate,createDeposit);

router.get("/history/:stbx_uid", getDepositHistory);

router.get("/:STRId", getDepositById);


module.exports = router;
const express = require("express");

const router = express.Router();

const {
  createWithdraw,
  getWithdrawHistory,
  getWithdrawById
} = require("../controllers/withdrawController");

const {
  withdrawValidation
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

router.post("/",withdrawValidation,validate,createWithdraw);

router.get("/history/:stbx_uid", getWithdrawHistory);

router.get("/:STRId", getWithdrawById);

module.exports = router;
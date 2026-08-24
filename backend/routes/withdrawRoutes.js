const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

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

router.post("/", verifyToken, withdrawValidation, validate, createWithdraw);

router.get("/history/:stbx_uid", verifyToken, getWithdrawHistory);

router.get("/:STRId", verifyToken, getWithdrawById);

module.exports = router;
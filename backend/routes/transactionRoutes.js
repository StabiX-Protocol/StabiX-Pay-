const express = require("express");
const router = express.Router();

const {
  sendTransaction,
  getTransactionHistory,
  getTransactionBySTRId
} = require("../controllers/transactionController");

const { transactionValidation } = require("../validators/transactionValidator");
const { validationResult } = require("express-validator");
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

router.post("/send",transactionValidation,validate, sendTransaction);
router.get("/history/:stbx_uid", getTransactionHistory);
router.get("/:str_id", getTransactionBySTRId);

module.exports = router;
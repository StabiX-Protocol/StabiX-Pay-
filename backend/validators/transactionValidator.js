const { body } = require("express-validator");

const transactionValidation = [

  body("sender_stbx_uid")
    .notEmpty()
    .withMessage("Sender STBX UID is required"),

  body("receiver_stbx_uid")
    .notEmpty()
    .withMessage("Receiver STBX UID is required"),

  body("asset")
    .isIn(["USDT", "USDC"])
    .withMessage("Invalid asset"),

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0")

];

module.exports = {
  transactionValidation
};

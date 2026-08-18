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

const depositValidation = [
body("stbx_uid")
.notEmpty()
.withMessage("STBX UID is required"),

body("asset")
.isIn(["USDT", "USDC"])
.withMessage("Invalid asset"),

body("amount")
.isFloat({ gt: 0 })
.withMessage("Amount must be greater than 0"),

body("blockchain_tx_hash")
.matches(/^0x[a-fA-F0-9]{64}$/)
.withMessage("Invalid blockchain transaction hash")
];


const withdrawValidation = [

  body("stbx_uid")
    .trim()
    .notEmpty()
    .withMessage("STBX UID is required"),

  body("asset")
    .isIn(["USDT", "USDC"])
    .withMessage("Invalid asset"),

  body("mode")
    .isIn(["instant", "advanced"])
    .withMessage("Invalid withdraw mode"),

  body("network")
    .isIn([
      "Ethereum (Testnet)",
      "Arbitrum (Testnet)",
      "Polygon (Testnet)",
      "Base (Testnet)",
      "Tron (Testnet)"
    ])
    .withMessage("Invalid withdraw network"),

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),

  body("wallet_address")
    .trim()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage("Invalid wallet address")

];
module.exports = {
  transactionValidation,
  depositValidation,
  withdrawValidation
};

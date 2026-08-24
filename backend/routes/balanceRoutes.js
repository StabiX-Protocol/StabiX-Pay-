const express = require("express");
const router = express.Router();
const{verifyToken} = require("../middleware/authMiddleware");

const {
getBalance
} = require("../controllers/balanceController");


router.get("/",verifyToken, getBalance);

module.exports = router;
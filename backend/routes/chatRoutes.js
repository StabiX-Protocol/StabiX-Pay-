const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
  getChatStatus,
  setChatStatus,
} = require("../controllers/chatController");


router.get(
  "/:stbx_uid",
  verifyToken,
  getChatStatus
);


router.patch(
  "/",
  verifyToken,
  setChatStatus
);


module.exports = router;
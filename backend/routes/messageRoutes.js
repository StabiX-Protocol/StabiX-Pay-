const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
  sendMessage,
  getMessages,
  markMessagesSeen,
  deleteMessage
} = require("../controllers/messageController");


router.post(
  "/",
  verifyToken,
  sendMessage
);


router.get(
  "/:stbx_uid",
  verifyToken,
  getMessages
);


router.patch(
  "/:stbx_uid/seen",
  verifyToken,
  markMessagesSeen
);


router.delete(
  "/:id",
  verifyToken,
  deleteMessage
);


module.exports = router;
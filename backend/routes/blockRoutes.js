const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  blockUser,
  unblockUser,
getBlockStatus
} = require("../controllers/blockController");

router.post(
  "/",
  verifyToken,
  blockUser
);

router.delete(
  "/",
  verifyToken,
  unblockUser
);

router.get(
  "/:stbx_uid",
  verifyToken,
  getBlockStatus
);

module.exports = router;
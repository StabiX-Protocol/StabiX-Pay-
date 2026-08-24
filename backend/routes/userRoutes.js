const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/authMiddleware");

const {
  registerUser,
  getUser,
  getProfile,
  updateUsername,
  loginUser,
  googleLogin,
  updateEOAAddress,
  resetPassword
} = require("../controllers/userController");

router.get("/profile/:stbx_uid", verifyToken, getProfile);

router.get("/:stbx_uid", verifyToken, getUser);

router.patch("/username", verifyToken, updateUsername);

router.patch("/eoa-address", verifyToken, updateEOAAddress);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login/google", googleLogin);
router.patch("/reset-password", resetPassword);


module.exports = router;

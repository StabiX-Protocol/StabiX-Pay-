const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/authMiddleware");
const profileUpload = require("../middleware/profileUpload");

const {
  registerUser,
  getUser,
  getProfile,
  updateUsername,
  loginUser,
  googleLogin,
  updateEOAAddress,
  resetPassword,
  uploadProfileImage,
  checkProfileImage,
  removeProfileImage,
} = require("../controllers/userController");

router.get("/profile/:stbx_uid", verifyToken, getProfile);

router.get("/:stbx_uid", verifyToken, getUser);

router.patch("/username", verifyToken, updateUsername);

router.patch("/eoa-address", verifyToken, updateEOAAddress);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login/google", googleLogin);
router.patch("/reset-password", resetPassword);
router.post("/profile-image", verifyToken, profileUpload.single("profile_image"), uploadProfileImage);
router.delete("/profile-image", verifyToken, removeProfileImage);
router.post("/profile-image/check", verifyToken, profileUpload.single("profile_image"), checkProfileImage);

module.exports = router;

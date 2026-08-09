const express = require("express");
const router = express.Router();

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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login/google", googleLogin);
router.get("/profile/:stbx_uid", getProfile);
router.get("/:stbx_uid", getUser);
router.patch("/username", updateUsername);
router.patch("/eoa-address", updateEOAAddress);
router.patch("/reset-password", resetPassword);



module.exports = router;

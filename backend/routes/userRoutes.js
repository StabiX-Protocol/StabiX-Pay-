const express = require("express");
const router = express.Router();

const {
  registerUser,
  getUser,
  getProfile,
  updateUsername,
  googleLogin,
  updateEOAAddress
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login/google", googleLogin);
router.get("/profile/:stbx_uid", getProfile);
router.get("/:stbx_uid", getUser);
router.patch("/username", updateUsername);
router.patch("/eoa-address", updateEOAAddress)



module.exports = router;

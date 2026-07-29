const express = require("express");
const router = express.Router();

const { registerUser, getUser, getProfile, updateUsername } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/profile/:stbx_uid", getProfile);
router.get("/:stbx_uid", getUser);
router.patch("/username", updateUsername);


module.exports = router;

const express = require("express");
const router = express.Router();

const { registerUser, getUser, updateUsername } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/:stbx_uid", getUser);
router.patch("/username", updateUsername);


module.exports = router;

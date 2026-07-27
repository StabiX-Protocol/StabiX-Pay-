const express = require("express");
const router = express.Router();

const { registerUser, getUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/:stbx_uid", getUser);
module.exports = router;

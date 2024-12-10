const express = require("express");
const { Login, Logout, Register } = require("../controllers/Users");
const { refreshToken } = require("../controllers/RefreshToken");

const router = express.Router();

router.post("/login", Login);
// router.post('/register', Register);
router.get("/token", refreshToken);
router.delete("/logout", Logout);

module.exports = router;

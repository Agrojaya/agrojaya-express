const express = require("express");
const { Login, Logout } = require("../controllers/Admin");
const verifyToken = require("../middleware/VerifyToken");

const router = express.Router();

// Rute untuk login
router.post("/loginadmin", Login);

// Rute untuk logout
router.post("/logoutadmin", Logout);  // Menggunakan POST untuk logout lebih semantik sesuai dengan tindakan yang dilakukan

// Rute yang dilindungi dengan token
router.get("/dashboardadmin", verifyToken, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard" });
});

module.exports = router;

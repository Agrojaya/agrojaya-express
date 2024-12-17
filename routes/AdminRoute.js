const express = require("express");
const { Login, Logout } = require("../controllers/Admin");
const verifyToken = require("../middleware/VerifyToken");

const router = express.Router();

// Rute untuk login
router.post("/loginadmin", Login);

// Rute untuk logout
router.delete("/logoutadmin", Logout);

// Rute yang dilindungi dengan token
router.get("/dashboardadmin", verifyToken, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard" });
});

module.exports = router;

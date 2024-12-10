const db = require("../config/Database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// login.js
exports.Login = async (req, res) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const { email, password } = req.body;

    const [user] = await db.promise().query(
      `
              SELECT id, username, email, password, role 
              FROM users 
              WHERE email = ?`,
      [email]
    );

    console.log("User  found:", user);

    if (user.length === 0) {
      return res.status(404).json({ msg: "User  tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      return res.status(401).json({ msg: "Password salah" });
    }

    if (user[0].role !== "Admin") {
      return res.status(403).json({ msg: "Akses terbatas hanya untuk Admin" });
    }

    const { id: userId, username } = user[0];
    const accessToken = jwt.sign(
      { userId, username, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      accessToken,
      user: { id: userId, username, email: user[0].email, role: user[0].role }, // Tambahkan role di sini
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Logout
exports.Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  try {
    await db.promise().query(
      `
            UPDATE users SET refresh_token = NULL WHERE refresh_token = ?`,
      [refreshToken]
    );
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

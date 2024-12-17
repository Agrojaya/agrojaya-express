const db = require("../config/Database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.Login = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debug input dari client

    // Destructure email dan password dari request body
    const { email, password } = req.body; 

    // Query database untuk mencari admin berdasarkan email atau username
    const [admin] = await db.promise().query(
      `SELECT id, username, email, password FROM admins WHERE email = ? OR username = ?`,
      [email, email]
    );
    console.log("Admin Query Result:", admin); // Debug hasil query

    // Cek apakah admin ditemukan
    if (admin.length === 0) {
      console.log("Admin Not Found");
      return res.status(400).json({ msg: "Email atau Username salah" });
    }

    // Cek apakah password sesuai
    const match = await bcrypt.compare(password, admin[0].password);
    console.log("Password Match:", match); // Debug hasil password comparison

    if (!match) {
      return res.status(400).json({ msg: "Password salah, harap coba lagi" });
    }

    // Buat access token dan refresh token
    const { id: adminId, username, email: adminEmail } = admin[0];
    const accessToken = jwt.sign(
      { adminId, username, adminEmail },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { adminId, username, adminEmail },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Simpan refresh token di database
    await db.promise().query(
      `UPDATE admins SET refresh_token = ? WHERE id = ?`,
      [refreshToken, adminId]
    );

    // Set cookie untuk refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
      secure: process.env.NODE_ENV === "production", // Set to true if you're using HTTPS
      sameSite: "Strict", // Ensure cookies are only sent to the same origin
    });

    // Kirim response dengan access token dan data admin
    res.json({
      accessToken,
      admin: {
        id: adminId,
        name: username,
        email: adminEmail,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// controllers/Admin.js
exports.Logout = async (req, res) => {
  try {
    const { adminId } = req.body;  // Asumsi, Anda mendapatkan adminId dari token
    // Hapus refresh token di database
    await db.promise().query(`UPDATE admins SET refresh_token = NULL WHERE id = ?`, [adminId]);

    // Hapus cookie refresh token
    res.clearCookie('refreshToken');

    res.status(200).json({ msg: "Logout berhasil" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

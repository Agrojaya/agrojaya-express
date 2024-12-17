const db = require("../config/Database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Periksa apakah email atau username ada
    const [admin] = await db.promise().query(
      `SELECT id, username, email, password FROM admins WHERE email = ? OR username = ?`,
      [email, email] // Bisa mencari berdasarkan email atau username
    );

    if (admin.length === 0) {
      return res.status(400).json({ msg: "Email atau Username salah" });
    }

    const match = await bcrypt.compare(password, admin[0].password);
    if (!match) {
      return res.status(400).json({ msg: "Password salah, harap coba lagi" });
    }

    const { id: adminId, username, email: adminEmail } = admin[0];
    const accessToken = jwt.sign(
      { adminId, username, adminEmail },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "20s" }
    );

    const refreshToken = jwt.sign(
      { adminId, username, adminEmail },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Update refresh token di database
    await db
      .promise()
      .query(`UPDATE admins SET refresh_token = ? WHERE id = ?`, [
        refreshToken,
        adminId,
      ]);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    // Return the access token dan admin details dalam response
    res.json({
      accessToken,
      admin: {
        id: adminId,
        name: username, // menggunakan 'username' sebagai 'name'
        email: adminEmail,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  try {
    const [rows] = await db
      .promise()
      .query(`SELECT id FROM admins WHERE refresh_token = ?`, [refreshToken]);

    const admin = rows[0];
    if (!admin) return res.sendStatus(204);

    const adminId = admin.id;

    // Hapus refresh token dari database
    await db
      .promise()
      .query(`UPDATE admins SET refresh_token = NULL WHERE id = ?`, [adminId]);

    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

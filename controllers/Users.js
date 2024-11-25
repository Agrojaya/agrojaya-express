const db = require('../config/Database'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register
exports.Register = async (req, res) => {
    const { uid, username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [existingUser] = await db.promise().query(`
            SELECT id FROM users WHERE id = ?`, [uid]);

        if (existingUser.length > 0) {
            return res.status(200).json({ msg: "UID sudah terdaftar, tidak ada perubahan" });
        }

        await db.promise().query(`
            INSERT INTO users (id, username, email, password)
            VALUES (?, ?, ?, ?)`, [uid, username, email, hashedPassword]);

        res.status(201).json({ msg: "Register Berhasil" });
    } catch (error) {
        console.error("Error in Register:", error);
        res.status(400).json({ msg: "Gagal melakukan registrasi", error: error.message });
    }
};

// Login
exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cek apakah email valid
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ msg: 'User tidak ditemukan' });

        // Verifikasi password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ msg: 'Password salah' });

        // Buat token JWT
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET, // Pastikan variabel ini ada
            { expiresIn: '1h' }
        );

        res.json({ accessToken, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Terjadi kesalahan pada server' });
    }
};

    //     try {
//         const { email, password } = req.body;

//         const [user] = await db.promise().query(`
//             SELECT id, username, email, password, role 
//             FROM users 
//             WHERE email = ?`, [email]);

//         if (user.length === 0) {
//             return res.status(400).json({ msg: "Email tidak ditemukan, silahkan daftar" });
//         }

//         const match = await bcrypt.compare(password, user[0].password);
//         if (!match) {
//             return res.status(400).json({ msg: "Password Salah, harap coba lagi" });
//         }

//         if (user[0].role !== 'Admin') {
//             return res.status(403).json({ msg: "Akses terbatas hanya untuk Admin" });
//         }

//         const { id: userId, username, email: userEmail } = user[0];
//         const accessToken = jwt.sign(
//             { userId, username, userEmail, role: user[0].role },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: '1h' }
//         );

//         const refreshToken = jwt.sign(
//             { userId, username, userEmail, role: user[0].role },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: '7d' }
//         );

//         await db.promise().query(`
//             UPDATE users SET refresh_token = ? WHERE id = ?`, [refreshToken, userId]);

//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//         });

//         res.json({
//             accessToken,
//             user: { id: userId, name: username, email: userEmail },
//         });
//     } catch (error) {
//         console.error("Error in login:", error);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };


exports.Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    try {
        // Query untuk mencari user berdasarkan refresh token
        const [rows] = await db.promise().query(`
            SELECT id
            FROM users
            WHERE refresh_token = ?`, [refreshToken]);

        const user = rows[0];
        if (!user) return res.sendStatus(204);

        const userId = user.id;

        // Hapus refresh token dari database
        await db.promise().query(`
            UPDATE users
            SET refresh_token = NULL
            WHERE id = ?`, [userId]);

        res.clearCookie('refreshToken');
        return res.sendStatus(200);
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

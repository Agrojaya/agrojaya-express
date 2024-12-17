const db = require("./Database"); // Mengimpor koneksi database
const bcrypt = require("bcrypt"); // Mengimpor bcrypt untuk enkripsi password

// Fungsi untuk membuat tabel admins dan menambahkan data admin pertama jika belum ada
const createAdmin = async () => {
  try {
    // Query untuk membuat tabel admins jika belum ada
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            refresh_token TEXT DEFAULT NULL
        );
        `;

    // Mengeksekusi query untuk membuat tabel
    await db.promise().query(createTableQuery);
    console.log("Tabel admins sudah ada atau berhasil dibuat.");

    // Memeriksa apakah sudah ada admin di dalam tabel
    const [existingAdmins] = await db
      .promise()
      .query("SELECT COUNT(*) AS count FROM admins");

    // Jika tidak ada admin, tambahkan admin pertama
    if (existingAdmins[0].count === 0) {
      const hashedPassword = await bcrypt.hash("adminpassword", 10); // Mengenkripsi password admin pertama

      const insertAdminQuery = `
            INSERT INTO admins (username, email, password)
            VALUES ('admin', 'admin@example.com', ?)
            `;

      // Mengeksekusi query untuk menambahkan admin pertama
      await db.promise().query(insertAdminQuery, [hashedPassword]);
      console.log("Admin pertama berhasil ditambahkan.");
    } else {
      console.log("Admin sudah ada di database.");
    }
  } catch (error) {
    console.error("Error dalam pembuatan tabel atau penambahan admin:", error);
  }
};

module.exports = { createAdmin };

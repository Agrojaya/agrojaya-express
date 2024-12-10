const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// Konfigurasi koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agrojaya", // Pastikan password sesuai dengan yang digunakan
});

// Membuka koneksi ke database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }

  console.log("Connected to MySQL");

  // Cek apakah database 'agrojaya' ada
  db.query('SHOW DATABASES LIKE "agrojaya"', async (err, results) => {
    if (err) {
      console.error("Error checking database:", err.message);
      return;
    }

    // Jika database belum ada, buat database baru
    if (results.length === 0) {
      console.log('Database "agrojaya" not found. Creating database...');
      db.query("CREATE DATABASE agrojaya", (err) => {
        if (err) {
          console.error("Error creating database:", err.message);
          return;
        }
        console.log('Database "agrojaya" created successfully');
        setupDatabase();
      });
    } else {
      console.log('Database "agrojaya" already exists');
      setupDatabase();
    }
  });
});

// Fungsi untuk mengatur tabel dan data dummy
async function setupDatabase() {
  // Menggunakan database 'agrojaya'
  db.changeUser({ database: "agrojaya" }, async (err) => {
    if (err) {
      console.error('Error switching to "agrojaya" database:', err.message);
      return;
    }
    console.log('Switched to "agrojaya" database');

    // Buat tabel 'users'
    const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uid VARCHAR(50) UNIQUE,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                role ENUM('Admin', 'User ') NOT NULL DEFAULT 'User ',
                refresh_token TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
    db.query(createUsersTableQuery, (err) => {
      if (err) {
        console.error("Error creating users table:", err.message);
        return;
      }
      console.log("Users table created or already exists");
    });

    // Buat tabel 'packages'
    const createPackagesTableQuery = `
            CREATE TABLE IF NOT EXISTS packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                photo VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
    db.query(createPackagesTableQuery, (err) => {
      if (err) {
        console.error("Error creating packages table:", err.message);
        return;
      }
      console.log("Packages table created or already exists");
    });

    // Buat tabel 'transactions'
    const createTransactionsTableQuery = `
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(50) NOT NULL,
                user_id INT NOT NULL,
                package_id INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                status ENUM('Proses', 'Selesai', 'Batal') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (package_id) REFERENCES packages(id)
            );
        `;
    db.query(createTransactionsTableQuery, (err) => {
      if (err) {
        console.error("Error creating transactions table:", err.message);
        return;
      }
      console.log("Transactions table created or already exists");
    });

    // Tambahkan data dummy untuk 'packages'
    const insertPackagesQuery = `
            INSERT IGNORE INTO packages (name, description, price)
            VALUES
            ('Paket Dasar', 'Paket ini mencakup fitur dasar yang sesuai untuk kebutuhan personal.', 100000),
            ('Paket Premium', 'Paket ini mencakup fitur lengkap untuk pengguna profesional.', 250000),
            ('Paket Bisnis', 'Paket ini dirancang untuk memenuhi kebutuhan bisnis.', 500000);
        `;
    db.query(insertPackagesQuery, (err) => {
      if (err) {
        console.error("Error inserting dummy packages:", err.message);
        return;
      }
      console.log("Dummy packages inserted successfully");
    });

    // Tambahkan data dummy untuk 'artikel'
    // const insertArtikelQuery = `
    //         INSERT IGNORE INTO artikel (judul, penulis, tanggal, isi)
    //         VALUES
    //         (
    //             'Bagaimana Cara Memanfaatkan Lahan yang Terbatas?',
    //             'Sri Rahayu',
    //             '2024-11-21',
    //             'Inilah beberapa cara memanfaatkan lahan sempit untuk bercocok tanam yang tepat.'
    //         );
    //         `;

    // db.query(insertArtikelQuery, (err) => {
    //   if (err) {
    //     console.error("Error inserting dummy artikel:", err.message);
    //     return;
    //   }
    //   console.log("Dummy artikel inserted successfully");
    // });

    // Tambahkan data dummy untuk 'users'
    const hashedPassword = await bcrypt.hash("password123", 10);
    const insertUsersQuery = `
            INSERT IGNORE INTO users (username, email, password, first_name, last_name, role)
            VALUES
            ('adminUser ', 'admin@example.com', '${hashedPassword}', 'Admin', 'User ', 'Admin'),
            ('normalUser ', 'user@example.com', '${hashedPassword}', 'Normal', 'User ', 'User ');
        `;
    db.query(insertUsersQuery, (err) => {
      if (err) {
        console.error("Error inserting dummy users:", err.message);
        return;
      }
      console.log("Dummy users inserted successfully");
    });

    // Tambahkan data dummy untuk 'transactions'
    const selectTransactionDataQuery = `
    SELECT u.id AS user_id, 
           CONCAT('INV', LPAD(FLOOR(RAND() * 1000), 3, '0')) AS invoice_number,
           p.id AS package_id, 
           p.price,
           'Proses' AS status
    FROM users u
    JOIN packages p ON p.id IS NOT NULL
    WHERE u.role = 'User ';
    `;

    db.query(selectTransactionDataQuery, (err, results) => {
      if (err) {
        console.error("Error selecting data for transactions:", err.message);
        return;
      }

      console.log("Selected transaction data:", results);

      if (results.length === 0) {
        console.error("No data found for transactions.");
        return;
      }

      const insertQuery = `
        INSERT INTO transactions (user_id, invoice_number, package_id, price, status)
        VALUES ?;
      `;
      const values = results.map((row) => [
        row.user_id,
        row.invoice_number,
        row.package_id,
        row.price,
        row.status,
      ]);

      db.query(insertQuery, [values], (err) => {
        if (err) {
          console.error("Error inserting transactions:", err.message);
          return;
        }
        console.log("Dummy transactions inserted successfully");
      });
    });
  });
}

module.exports = db;

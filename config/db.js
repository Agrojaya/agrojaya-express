const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Membuat koneksi ke MySQL (tanpa memilih database terlebih dahulu)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Pastikan password sesuai dengan yang digunakan
});

// Menghubungkan ke MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }

  console.log('Connected to MySQL');

  // Cek apakah database 'agrojaya' ada
  connection.query('SHOW DATABASES LIKE "agrojaya"', async (err, results) => {
    if (err) {
      console.error('Error checking database:', err.message);
      return;
    }

    // Jika database belum ada, buat database baru
    if (results.length === 0) {
      console.log('Database "agrojaya" not found. Creating database...');
      connection.query('CREATE DATABASE agrojaya', (err) => {
        if (err) {
          console.error('Error creating database:', err.message);
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
  connection.changeUser({ database: 'agrojaya' }, async (err) => {
    if (err) {
      console.error('Error switching to "agrojaya" database:', err.message);
      return;
    }
    console.log('Switched to "agrojaya" database');

    // Buat tabel 'users'
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        role ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    connection.query(createUsersTableQuery, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
        return;
      }
      console.log('Users table created or already exists');
    });

    // Buat tabel 'transactions'
    const createTransactionsTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        invoice_number VARCHAR(50) NOT NULL,
        package_name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status ENUM('Proses', 'Selesai', 'Batal') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;
    connection.query(createTransactionsTableQuery, (err) => {
      if (err) {
        console.error('Error creating transactions table:', err.message);
        return;
      }
      console.log('Transactions table created or already exists');
    });

    // Tambahkan data dummy
    const hashedPassword = await bcrypt.hash('password123', 10);
    const insertUsersQuery = `
      INSERT IGNORE INTO users (username, email, password, first_name, last_name, role)
      VALUES
      ('adminUser', 'admin@example.com', '${hashedPassword}', 'Admin', 'User', 'Admin'),
      ('normalUser', 'user@example.com', '${hashedPassword}', 'Normal', 'User', 'User');
    `;
    connection.query(insertUsersQuery, (err) => {
      if (err) {
        console.error('Error inserting dummy users:', err.message);
        return;
      }
      console.log('Dummy users inserted successfully');
    });

    const insertTransactionsQuery = `
      INSERT INTO transactions (user_id, invoice_number, package_name, price, status)
      SELECT id, CONCAT('INV', LPAD(FLOOR(RAND() * 1000), 3, '0')), 'Paket Dasar', 500000, 'Proses'
      FROM users WHERE role = 'User';
    `;
    connection.query(insertTransactionsQuery, (err) => {
      if (err) {
        console.error('Error inserting dummy transactions:', err.message);
        return;
      }
      console.log('Dummy transactions inserted successfully');
    });
  });
}

module.exports = connection;

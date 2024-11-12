const mysql = require('mysql2');

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
  connection.query('SHOW DATABASES LIKE "agrojaya"', (err, results) => {
    if (err) {
      console.error('Error checking database:', err.message);
      return;
    }

    // Jika database belum ada, buat database baru
    if (results.length === 0) {
      console.log('Database "agrojaya" not found. Creating database...');

      // Buat database 'agrojaya'
      connection.query('CREATE DATABASE agrojaya', (err) => {
        if (err) {
          console.error('Error creating database:', err.message);
          return;
        }

        console.log('Database "agrojaya" created successfully');
      });
    } else {
      console.log('Database "agrojaya" already exists');
    }
  });
});

// Menggunakan database 'agrojaya' setelah dicek
connection.changeUser({ database: 'agrojaya' }, (err) => {
  if (err) {
    console.error('Error switching to "agrojaya" database:', err.message);
    return;
  }

  console.log('Switched to "agrojaya" database');
});

module.exports = connection;

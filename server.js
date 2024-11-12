const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./config/db'); // Pastikan file ini mengatur koneksi ke database

const app = express();

// Cek apakah koneksi database berjalan dengan benar
db.query('SELECT 1', (err, results) => {
  if (err) {
    console.log('Database connection failed:', err);
  } else {
    console.log('Database is connected');
  }
});

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Example endpoint
app.get('/', (req, res) => {
  res.send('Agrojaya jaya jaya');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

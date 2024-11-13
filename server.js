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

app.use(cors());
app.use(bodyParser.json());

// Rute login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT username, role, firstname FROM user WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      const user = results[0];
      const token = jwt.sign({ username: user.username, role: user.role, firstname: user.firstname }, 'your_secret_key', { expiresIn: '24h' });
      res.send({ message: 'Login successful', token });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  });
});

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
};

// Rute untuk mendapatkan status pengguna yang sedang login
app.get('/api/user', verifyToken, (req, res) => {
  res.send({ user: req.user });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

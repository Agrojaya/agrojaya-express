const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  });
});

// Middleware verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
};

// Endpoint untuk mendapatkan data pengguna
router.get('/user', verifyToken, (req, res) => {
  res.send({ user: req.user });
});

// Endpoint untuk mendapatkan aktivitas user (paginasi 10)
router.get('/user-activity', verifyToken, (req, res) => {
    const userId = req.user.id;
  
    const activityQuery = `
      SELECT * FROM transactions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10;
    `;
  
    db.query(activityQuery, [userId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Error retrieving activities' });
      res.status(200).json({ activities: results });
    });
  });
  
  // Endpoint untuk mendapatkan transaksi (paginasi 10)
  router.get('/transactions', verifyToken, (req, res) => {
    const transactionQuery = `
      SELECT t.id, t.invoice_number, t.package_name, t.price, t.status, u.username 
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10;
    `;
  
    db.query(transactionQuery, (err, results) => {
      if (err) return res.status(500).json({ message: 'Error retrieving transactions' });
      res.status(200).json({ transactions: results });
    });
  });

  
module.exports = router;

const mysql = require("mysql2");

// Konfigurasi koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_agrojaya",
  port: 3306,
});

module.exports = db;

const express = require("express");
const db = require("./config/Database.js");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const FileUpload = require("express-fileupload");
const UserRoute = require("./routes/UserRoute.js");
const PaketRoute = require("./routes/PaketRoute.js");
const ArtikelRoute = require("./routes/ArtikelRoute.js");
const TransactionRoute = require("./routes/TransactionRoute.js");
const ActivityRoute = require("./routes/ActivityRoute.js");

// Memuat variabel lingkungan dari file .env
dotenv.config();

console.log("JWT_SECRET in index.js:", process.env.JWT_SECRET); // Log untuk memeriksa nilai

const app = express();
const PORT = process.env.APP_PORT || 3000;
const server_host = process.env.YOUR_HOST || "0.0.0.0";

// Koneksi ke database
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.message);
    return;
  }
  console.log("Connected to MySQL");
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // URL frontend
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Routing
app.use(UserRoute);
app.use(PaketRoute);
app.use(ArtikelRoute);
app.use(TransactionRoute);
app.use(ActivityRoute);

// Menjalankan server
app.listen(PORT, server_host, () => {
  console.log(`Server up and running on port ${PORT}...`);
});

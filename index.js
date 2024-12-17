const express = require("express");
const db = require("./config/Database.js");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const FileUpload = require("express-fileupload");
const UserRoute = require("./routes/UserRoute.js");
const PaketRoute = require("./routes/PaketRoute.js");
const ArtikelRoute = require("./routes/ArtikelRoute.js");
const AlamatRoute = require("./routes/AlamatRoute.js");
const TransaksiRoute = require("./routes/TransaksiRoute.js");
const AdminRoute = require("./routes/AdminRoute.js");
const { createAdmin } = require("./config/Admin.js");

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;
const server_host = process.env.YOUR_HOST || "0.0.0.0";

// Memeriksa koneksi ke database
db.connect((err) => {
  if (err) {
    console.error("Koneksi ke database gagal:", err);
  } else {
    console.log("Koneksi ke database berhasil.");
  }
});
createAdmin();
app.use(cors({ credentials: false }));
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(UserRoute);
app.use(PaketRoute);
app.use(ArtikelRoute);
app.use(AlamatRoute);
app.use(TransaksiRoute);
app.use(AdminRoute);

app.listen(PORT, server_host, () => {
  console.log(`Server up and running on port ${PORT}...`);
});

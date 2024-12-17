const express = require("express");
const {
  getArtikel,
  getArtikelById,
  createArtikel,
  updateArtikel,
  deleteArtikel,
} = require("../controllers/Artikel");

const router = express.Router();

// Rute untuk mengambil semua artikel
router.get("/api/artikel", getArtikel);

// Rute untuk mengambil artikel berdasarkan ID
router.get("/api/artikel/:id", getArtikelById);

// Rute untuk membuat artikel baru
router.post("/api/artikel", createArtikel);

// Rute untuk memperbarui artikel berdasarkan ID
router.put("/api/artikel/:id", updateArtikel);

// Rute untuk menghapus artikel berdasarkan ID
router.delete("/api/artikel/:id", deleteArtikel);

module.exports = router;

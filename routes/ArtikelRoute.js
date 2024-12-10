const express = require("express");
const {
  getArtikel,
  getArtikelById,
  createArtikel,
  updateArtikel,
  deleteArtikel,
} = require("../controllers/Artikel");

const router = express.Router();

router.get("/api/artikel", getArtikel);
router.get("/api/artikel/:id", getArtikelById);
router.post("/api/artikel", createArtikel);
router.put("/api/artikel/:id", updateArtikel);
router.delete("/api/artikel/:id", deleteArtikel);

module.exports = router;

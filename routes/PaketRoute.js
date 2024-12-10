const express = require("express");
const {
  getPaket,
  getPaketById,
  createPaket,
  updatePaket,
  deletePaket,
} = require("../controllers/Paket");

const router = express.Router();

router.get("/data_paket", getPaket);
router.get("/data_paket/:id", getPaketById);
router.post("/paket", createPaket);
router.put("/data_paket/:id", updatePaket);
router.delete("/data_paket/:id", deletePaket);

module.exports = router;

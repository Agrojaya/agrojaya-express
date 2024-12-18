const db = require("../config/Database.js");
const path = require("path");
const fs = require("fs");

// Simpan Paket
exports.createPaket = async (req, res) => {
  const { nama_paket, harga, variasi_bibit, fitur, detail } = req.body;

  try {
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ msg: "Foto diperlukan" });
    }

    const photo = req.files.photo;
    const photoName = photo.md5 + path.extname(photo.name);
    const photoUrl = `${req.protocol}://${req.get("host")}/paket/${photoName}`;
    const uploadPath = path.join(__dirname, "../public/paket", photoName);

    await photo.mv(uploadPath);

    await db.promise().query(
      `INSERT INTO paket (nama_paket, harga, variasi_bibit, fitur, detail, photo) VALUES (?, ?, ?, ?, ?, ?)`,
      [nama_paket, harga, variasi_bibit, fitur, detail, photoUrl]
    );

    res.status(201).json({ msg: "Paket berhasil disimpan" });
  } catch (error) {
    console.error("Error in createPaket:", error.stack || error);
    res.status(500).json({ msg: "Gagal menyimpan paket", error: error.message });
  }
};

// Update Paket
exports.updatePaket = async (req, res) => {
  const { id } = req.params;
  const { nama_paket, harga, variasi_bibit, fitur, detail } = req.body;

  try {
    const [paketExist] = await db.promise().query(`SELECT * FROM paket WHERE id = ?`, [id]);

    if (paketExist.length === 0) {
      return res.status(404).json({ msg: "Paket tidak ditemukan" });
    }

    let photoUrl = paketExist[0].photo;

    // Update foto jika ada
    if (req.files && req.files.photo) {
      const photo = req.files.photo;
      const oldPhotoPath = path.join(__dirname, "../public/paket", path.basename(photoUrl));

      if (fs.existsSync(oldPhotoPath)) {
        await fs.promises.unlink(oldPhotoPath);
      }

      const photoName = photo.md5 + path.extname(photo.name);
      photoUrl = `${req.protocol}://${req.get("host")}/paket/${photoName}`;
      const uploadPath = path.join(__dirname, "../public/paket", photoName);

      await photo.mv(uploadPath);
    }

    await db.promise().query(
      `UPDATE paket SET nama_paket = ?, harga = ?, variasi_bibit = ?, fitur = ?, detail = ?, photo = ? WHERE id = ?`,
      [nama_paket, harga, variasi_bibit, fitur, detail, photoUrl, id]
    );

    res.status(200).json({ msg: "Paket berhasil diperbarui" });
  } catch (error) {
    console.error("Error in updatePaket:", error.stack || error);
    res.status(500).json({ msg: "Gagal memperbarui paket", error: error.message });
  }
};

// Hapus Paket
exports.deletePaket = async (req, res) => {
  const { id } = req.params;

  try {
    const [paketExist] = await db.promise().query(`SELECT * FROM paket WHERE id = ?`, [id]);

    if (paketExist.length === 0) {
      return res.status(404).json({ msg: "Paket tidak ditemukan" });
    }

    const photoPath = path.join(__dirname, "../public/paket", path.basename(paketExist[0].photo));

    if (fs.existsSync(photoPath)) {
      await fs.promises.unlink(photoPath);
    }

    await db.promise().query(`DELETE FROM paket WHERE id = ?`, [id]);

    res.status(200).json({ msg: "Paket berhasil dihapus" });
  } catch (error) {
    console.error("Error in deletePaket:", error);
    res.status(500).json({ msg: "Gagal menghapus paket", error: error.message });
  }
};

// Ambil Semua Paket
exports.getPaket = async (req, res) => {
  try {
    const [paket] = await db.promise().query(`SELECT * FROM paket`);

    if (paket.length === 0) {
      return res.status(404).json({ msg: "Tidak ada paket ditemukan" });
    }

    res.status(200).json(paket);
  } catch (error) {
    console.error("Error in getPaket:", error.stack || error);
    res.status(500).json({ msg: "Gagal mengambil data paket", error: error.message });
  }
};

// Ambil Paket Berdasarkan ID
exports.getPaketById = async (req, res) => {
  const { id } = req.params;

  try {
    const [paket] = await db.promise().query(`SELECT * FROM paket WHERE id = ?`, [id]);

    if (paket.length === 0) {
      return res.status(404).json({ msg: "Paket tidak ditemukan" });
    }

    res.status(200).json(paket[0]);
  } catch (error) {
    console.error("Error in getPaketById:", error.stack || error);
    res.status(500).json({ msg: "Gagal mengambil data paket", error: error.message });
  }
};

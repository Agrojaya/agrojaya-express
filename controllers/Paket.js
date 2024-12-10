const db = require("../config/Database.js");
const path = require("path");
const fs = require("fs");

// Simpan Paket
exports.createPaket = async (req, res) => {
  const { name, description, price } = req.body;

  try {
    // Pastikan file foto ada
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ msg: "Photo is required" });
    }

    const photo = req.files.photo;

    // Generate nama unik untuk foto menggunakan md5 dan ekstensi foto
    const photoName = photo.md5 + path.extname(photo.name);

    // Tentukan URL untuk mengakses foto
    const photoUrl = `${req.protocol}://${req.get("host")}/paket/${photoName}`;

    // Tentukan path untuk menyimpan foto di server
    const uploadPath = path.join(__dirname, "../public/paket", photoName);

    // Pindahkan foto ke folder public/paket
    await photo.mv(uploadPath);

    // Simpan data paket ke database
    await db
      .promise()
      .query(
        `INSERT INTO packages (name, description, price, photo) VALUES (?, ?, ?, ?)`,
        [name, description, price, photoUrl]
      );

    res.status(201).json({ msg: "Paket berhasil disimpan" });
  } catch (error) {
    console.error("Error in createPaket:", error.stack || error);
    res
      .status(500)
      .json({ msg: "Gagal menyimpan paket", error: error.message });
  }
};

// Update Paket
exports.updatePaket = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const [paketExist] = await db
      .promise()
      .query(`SELECT * FROM packages WHERE id = ?`, [id]);

    if (paketExist.length === 0) {
      return res.status(404).json({ msg: "Paket tidak ditemukan" });
    }

    let photoUrl = paketExist[0].photo;

    // Periksa apakah ada file foto baru
    if (req.files && req.files.photo) {
      const photo = req.files.photo;

      // Hapus foto lama dari server jika ada foto baru
      const oldPhotoPath = path.join(
        __dirname,
        "../public/paket",
        path.basename(photoUrl)
      );
      console.log("Old Photo Path:", oldPhotoPath); // Log path yang akan dihapus

      if (fs.existsSync(oldPhotoPath)) {
        try {
          await fs.promises.unlink(oldPhotoPath); // Hapus foto lama
        } catch (err) {
          console.error("Gagal menghapus foto lama:", err);
        }
      } else {
        console.log("File tidak ditemukan:", oldPhotoPath);
      }

      // Generate nama baru untuk foto
      const photoName = photo.md5 + path.extname(photo.name);
      photoUrl = `${req.protocol}://${req.get("host")}/paket/${photoName}`;

      // Tentukan path untuk menyimpan foto baru
      const uploadPath = path.join(__dirname, "../public/paket", photoName);

      // Pindahkan foto baru ke folder public/paket
      await photo.mv(uploadPath);
    }

    // Perbarui data paket di database
    const [result] = await db
      .promise()
      .query(
        `UPDATE packages SET name = ?, description = ?, price = ?, photo = ? WHERE id = ?`,
        [name, description, price, photoUrl, id]
      );

    console.log("Update Result:", result);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ msg: " Paket tidak ditemukan untuk diperbarui" });
    }

    res.status(200).json({ msg: "Paket berhasil diperbarui" });
  } catch (error) {
    console.error("Error in updatePaket:", error.stack || error);
    res
      .status(500)
      .json({ msg: "Gagal memperbarui paket", error: error.message });
  }
};

// Hapus Paket
exports.deletePaket = async (req, res) => {
  const { id } = req.params;

  try {
    // Menghapus transaksi yang mengacu pada paket ini terlebih dahulu
    await db
      .promise()
      .query(`DELETE FROM transactions WHERE package_id = ?`, [id]);

    // Cek apakah paket dengan ID yang diminta ada
    const [paketExist] = await db
      .promise()
      .query(`SELECT * FROM packages WHERE id = ?`, [id]);

    if (paketExist.length === 0) {
      return res.status(404).json({ msg: "Paket tidak ditemukan" });
    }

    // Hapus paket berdasarkan ID
    await db.promise().query(`DELETE FROM packages WHERE id = ?`, [id]);

    res.status(200).json({ msg: "Paket berhasil dihapus" });
  } catch (error) {
    console.error("Error in deletePaket:", error);
    res
      .status(500)
      .json({ msg: "Gagal menghapus paket", error: error.message });
  }
};

// Ambil Data Paket Berdasarkan ID
exports.getPaketById = async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil data paket berdasarkan ID
    const [paket] = await db
      .promise()
      .query(`SELECT * FROM packages WHERE id = ?`, [id]);

    if (paket.length === 0) {
      return res.status(404).json({ msg: "Paket tidak ditemukan" });
    }

    res.status(200).json(paket[0]);
  } catch (error) {
    console.error("Error in getPaketById:", error.stack || error);
    res
      .status(500)
      .json({ msg: "Gagal mengambil data paket", error: error.message });
  }
};

// Ambil Semua Paket
exports.getPaket = async (req, res) => {
  try {
    // Ambil semua data paket
    const [paket] = await db.promise().query(`SELECT * FROM packages`);

    if (paket.length === 0) {
      return res.status(404).json({ msg: "Tidak ada paket ditemukan" });
    }

    res.status(200).json(paket);
  } catch (error) {
    console.error("Error in getPaket:", error.stack || error);
    res
      .status(500)
      .json({ msg: "Gagal mengambil data paket", error: error.message });
  }
};

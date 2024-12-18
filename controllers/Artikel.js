const db = require("../config/Database");
const path = require("path");
const fs = require("fs");

// Simpan Artikel
exports.createArtikel = async (req, res) => {
  const { judul, penulis, tanggal, isi } = req.body;

  // Validasi input
  if (!judul || !penulis || !tanggal || !isi) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Pastikan file foto ada dan valid
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ msg: "Photo is required" });
    }

    const photo = req.files.photo;

    // Validasi ekstensi file foto
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(photo.mimetype)) {
      return res
        .status(400)
        .json({ msg: "Invalid photo format. Only JPG, PNG, JPEG are allowed" });
    }

    // Generate nama unik untuk foto menggunakan md5 dan ekstensi foto
    const photoName = photo.md5 + path.extname(photo.name);

    // Tentukan URL untuk mengakses foto
    const photoUrl = `${req.protocol}://${req.get(
      "host"
    )}/artikel/${photoName}`;

    // Tentukan path untuk menyimpan foto di server
    const uploadPath = path.join(__dirname, "../public/artikel", photoName);

    // Pindahkan foto ke folder public/artikel
    await photo.mv(uploadPath);

    // Simpan data artikel ke database
    await db
      .promise()
      .query(
        `INSERT INTO artikel (judul, penulis, tanggal, isi, photo) VALUES (?, ?, ?, ?, ?)`,
        [judul, penulis, tanggal, isi, photoUrl]
      );

    res.status(201).json({ msg: "Artikel berhasil disimpan" });
  } catch (error) {
    console.error("Error in createArtikel:", error.stack || error);
    res
      .status(500)
      .json({ msg: "Gagal menyimpan artikel", error: error.message });
  }
};

// Update Artikel
exports.updateArtikel = async (req, res) => {
  const { id } = req.params;
  const { judul, penulis, tanggal, isi } = req.body;

  // Validasi input
  if (!judul || !penulis || !tanggal || !isi) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const [artikelExist] = await db
      .promise()
      .query(`SELECT * FROM artikel WHERE id = ?`, [id]);

    if (artikelExist.length === 0) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    let photoUrl = artikelExist[0].photo;

    // Periksa apakah ada file foto baru
    if (req.files && req.files.photo) {
      const photo = req.files.photo;

      // Hapus foto lama dari server jika ada foto baru
      const oldPhotoPath = path.join(
        __dirname,
        "../public/artikel",
        path.basename(photoUrl)
      );

      if (fs.existsSync(oldPhotoPath)) {
        await fs.promises.unlink(oldPhotoPath); // Hapus foto lama
      }

      // Validasi ekstensi file foto
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(photo.mimetype)) {
        return res
          .status(400)
          .json({
            msg: "Invalid photo format. Only JPG, PNG, JPEG are allowed",
          });
      }

      // Generate nama baru untuk foto
      const photoName = photo.md5 + path.extname(photo.name);
      photoUrl = `${req.protocol}://${req.get("host")}/artikel/${photoName}`;

      // Tentukan path untuk menyimpan foto baru
      const uploadPath = path.join(__dirname, "../public/artikel", photoName);

      // Pindahkan foto baru ke folder public/artikel
      await photo.mv(uploadPath);
    }

    // Perbarui data artikel di database
    const [result] = await db
      .promise()
      .query(
        `UPDATE artikel SET judul = ?, penulis = ?, tanggal = ?, isi = ?, photo = ? WHERE id = ?`,
        [judul, penulis, tanggal, isi, photoUrl, id]
      );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ msg: "Artikel tidak ditemukan untuk diperbarui" });
    }

    res.status(200).json({ msg: "Artikel berhasil diperbarui" });
  } catch (error) {
    console.error("Error in updateArtikel:", error.stack || error);
    res
      .status(500)
      .json({ msg: "Gagal memperbarui artikel", error: error.message });
  }
};

// Hapus Artikel
exports.deleteArtikel = async (req, res) => {
  const { id } = req.params;

  try {
    const [artikelExist] = await db
      .promise()
      .query(`SELECT * FROM artikel WHERE id = ?`, [id]);

    if (artikelExist.length === 0) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    // Hapus artikel berdasarkan ID
    await db.promise().query(`DELETE FROM artikel WHERE id = ?`, [id]);

    res.status(200).json({ msg: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error("Error in deleteArtikel:", error);
    res
      .status(500)
      .json({ msg: "Gagal menghapus artikel", error: error.message });
  }
};

// Ambil Data Artikel
exports.getArtikel = async (req, res) => {
  try {
    const [artikel] = await db
      .promise()
      .query(`SELECT * FROM artikel ORDER BY id DESC`);

    res.status(200).json(artikel);
  } catch (error) {
    console.error("Error in getArtikel:", error);
    res
      .status(500)
      .json({ msg: "Gagal mengambil data artikel", error: error.message });
  }
};

// Ambil Data Artikel Berdasarkan ID
exports.getArtikelById = async (req, res) => {
  const { id } = req.params;

  try {
    // Query untuk mengambil artikel berdasarkan ID
    const [artikel] = await db
      .promise()
      .query(`SELECT * FROM artikel WHERE id = ?`, [id]);

    if (artikel.length === 0) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    // Query untuk mengambil artikel terkait (misalnya, berdasarkan kategori atau acak)
    const [relatedArticles] = await db
      .promise()
      .query(
        `SELECT id, judul, photo, LEFT(isi, 100) AS summary 
         FROM artikel 
         WHERE id != ? 
         ORDER BY RAND() LIMIT 4`, 
        [id]
      );

    // Gabungkan data artikel utama dengan artikel terkait
    const articleWithRelated = {
      ...artikel[0],
      relatedArticles,
    };

    res.status(200).json(articleWithRelated); 
  } catch (error) {
    console.error("Error in getArtikelById:", error);
    res
      .status(500)
      .json({ msg: "Gagal mengambil data artikel", error: error.message });
  }
};


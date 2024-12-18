const express = require("express");
const {
    createTransaksi,
    getAllTransaksi,
    getTransaksiById,
    getTransaksiByUid,
    getStatus,
    updateStatusTransaksi,
    updateTransaksi
} = require ("../controllers/Transaksi.js");

const router = express.Router();

router.post('/transaksi', createTransaksi);
router.get('/transaksi/byid/:order_id', getTransaksiById);
router.get('/transaksi/byuid/:uid', getTransaksiByUid);
router.get('/transaksi/status/:order_id', getStatus);
router.get('/transaksis', getAllTransaksi);
router.patch('/transaksi/updatestatus/:order_id', updateStatusTransaksi);
router.put('/transaksi/:order_id/update', updateTransaksi);
module.exports = router;
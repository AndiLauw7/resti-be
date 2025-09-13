const express = require("express");
const router = express.Router();

const kategoriController = require("../controllers/kategoriController");
const produkController = require("../controllers/produkController");
const userController = require("../controllers/userController");
const transaksiController = require("../controllers/transaksiController");
const keranjangController = require("../controllers/keranjangController");
const paymentController = require("../controllers/paymentController");
const { verifikasiToken, isAdmin } = require("../middlewares/authMiddlewares");
const upload = require("../middlewares/uploadImage");
const messageController = require("../controllers/messageController");
const { getProvinces, getCities } = require("../services/wilayahServices");
const { trackResi } = require("../services/ongkirServices");
const { cekOngkir } = require("../services/rajaOngkirServices");

router.post("/login", userController.loginPengguna);
router.post("/register", userController.registerPengguna);

router.get(
  "/pengguna/get-pengguna-all",
  verifikasiToken,
  isAdmin,
  userController.getAllPengguna
);
router.get(
  "/pengguna/get-pengguna-byid/:id",
  verifikasiToken,
  userController.getPenggunaByd
);
router.put(
  "/pengguna/update-pengguna/:id",
  upload.single("image"),
  verifikasiToken,
  userController.updataPengguna
);
router.delete(
  "/pengguna/delete-pengguna/:id",
  verifikasiToken,
  isAdmin,
  userController.deletePengguna
);

router.post("/kategori/create-kategori/", kategoriController.createKategori);
router.get("/kategori/get-kategori-all", kategoriController.getAllKategori);
router.get(
  "/kategori/get-kategori-byid/:id",
  kategoriController.getKategoriById
);
router.put(
  "/kategori/update-kategori-byid/:id",
  kategoriController.updateKategori
);
router.delete(
  "/kategori/delete-kategori-byid/:id",
  kategoriController.deleteKategori
);

router.post(
  "/produk/create-produk/",
  upload.single("image"),
  produkController.createProduk
);
router.get("/produk/get-produk-all", produkController.getAllProduk);
router.get("/produk/get-produk-byid/:id", produkController.getProdukById);
router.put(
  "/produk/update-produk-byid/:id",
  upload.single("image"),
  produkController.updateProduk
);
router.delete("/produk/delete-produk-byid/:id", produkController.deleteProduk);

router.post("/transaksi/create-transaksi", transaksiController.createTransaksi);
router.get("/transaksi/get-transaksi", transaksiController.getAllTransaksi);
router.get(
  "/transaksi/get-laporan-transaksi",
  transaksiController.getLaporanTransaksi
);
router.get(
  "/transaksi/get-transaksi/:id",
  transaksiController.getTransaksiById
);
router.get(
  "/transaksi/get-transaksi-user/:id",
  transaksiController.getTransaksiByUserId
);
router.get(
  "/transaksi/cetak-laporan-transaksi",

  transaksiController.cetakLaporanTransaksi
);
router.delete(
  "/transaksi/delete-transaksi/:id",
  transaksiController.deleteTransaksi
);

router.post("/keranjang/create-keranjang", keranjangController.createKeranjang);
router.post(
  "/keranjang/check-out-keranjang",
  keranjangController.checkOutKeranjang
);
router.put(
  "/keranjang/update-keranjang/:id",
  keranjangController.updateKeranjang
);

router.patch(
  "/keranjang/delete-item-keranjang/:id/item",
  keranjangController.deleteKeranjangPerItem
);

router.get(
  "/keranjang/get-keranjang/:penggunaId",
  keranjangController.getKeranjangByPengguna
);
router.delete(
  "/keranjang/delete-keranjang/:id",
  keranjangController.deleteKeranjangItem
);
router.delete(
  "/keranjang/delete-keranjang-all",
  keranjangController.clearKeranjang
);
router.post(
  "/payment/midtrans/create-payment",
  paymentController.createMidtransTransaksi
);

router.post(
  "/payment/midtrans/notifikasi",
  express.raw({ type: "application/json" }),
  // express.json(),
  paymentController.handleNotifications
);

router.get("/provinces", async (req, res) => {
  try {
    const data = await getProvinces();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cities/:id_provinsi", async (req, res) => {
  try {
    const data = await getCities(req.params.id_provinsi);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/track-resi", async (req, res) => {
  try {
    const { courier, awb } = req.body; // contoh: courier = "jne", awb = "582230008329223"
    const data = await trackResi({ courier, awb });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cost", async (req, res) => {
  const { origin, originType, destination, destinationType, weight, courier } =
    req.body;

  try {
    const result = await cekOngkir({
      origin,
      originType,
      destination,
      destinationType,
      weight,
      courier,
    });
    res.json(result);
  } catch (error) {
    console.error("❌ Error /cost:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/send-message", verifikasiToken, messageController.sendMessage);
router.get("/get-message", verifikasiToken, messageController.getMessage);
router.get(
  "/get-chat-partners",
  verifikasiToken,
  messageController.getChatPartners
);
module.exports = router;

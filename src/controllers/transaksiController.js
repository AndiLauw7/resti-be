const { Op } = require("sequelize");
const PDFDocument = require("pdfkit");
const path = require("path");
const moment = require("moment");
const { Transaksi, TransaksiItems, Produk, Pengguna } = require("../../models");

exports.createTransaksi = async (req, res) => {
  const { penggunaId, tanggal, items } = req.body;
  try {
    let total = 0;
    for (const item of items) {
      const dataProduk = await Produk.findByPk(item.produkId);
      if (!dataProduk) {
        return res
          .status(404)
          .json({ message: `Produk ID ${item.produkId} tidak ditemukan` });
      }
      total += dataProduk.harga * item.quantity;
    }
    const dataTransaksi = await Transaksi.create({
      penggunaId,
      tanggal,
      total,
    });
    for (const item of items) {
      const dataProduk = await Produk.findByPk(item.produkId);
      await TransaksiItems.create({
        transaksiId: dataTransaksi.id,
        produkId: item.produkId,
        quantity: item.quantity,
        subtotal: dataProduk.harga * item.quantity,
      });

      dataProduk.stok -= item.quantity;
      await dataProduk.save();
    }
    return res
      .status(201)
      .json({ message: "Transaksi berhasil dibuat", data: dataTransaksi });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal membuat transaksi", error: error.message });
  }
};

exports.getAllTransaksi = async (req, res) => {
  try {
    const data = await Transaksi.findAll({
      include: [
        { model: TransaksiItems, include: ["Produk"] },
        { model: Pengguna, attributes: ["id", "nama", "email"] },
      ],
    });
    res.status(200).json({ message: "Berhasil ambil semua transaksi", data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil transaksi", error: error.message });
  }
};

exports.getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Transaksi.findByPk(id, {
      include: [
        { model: TransaksiItems, include: ["Produk"] },
        { model: Pengguna, attributes: ["id", "nama", "email"] },
      ],
    });
    if (!data)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    res.status(200).json({ message: "Berhasil ambil transaksi", data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil transaksi", error: error.message });
  }
};

exports.deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const transaksi = await Transaksi.findByPk(id, {
      include: [TransaksiItems],
    });
    if (!transaksi)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });

    // Kembalikan stok produk
    for (const item of transaksi.TransaksiItems) {
      const produk = await Produk.findByPk(item.produkId);
      produk.stok += item.quantity;
      await produk.save();
    }

    await TransaksiItems.destroy({ where: { transaksiId: id } });
    await Transaksi.destroy({ where: { id } });

    res.status(200).json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus transaksi", error: error.message });
  }
};

exports.getLaporanTransaksi = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let tanggalFlter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      tanggalFlter = {
        tanggal: {
          [Op.between]: [start, end],
        },
      };
    }

    const transaksi = await Transaksi.findAll({
      where: tanggalFlter,
      include: [
        {
          model: Pengguna,
          attributes: ["id", "nama", "email"],
        },
        {
          model: TransaksiItems,
          include: [{ model: Produk, attributes: ["id", "nama", "harga"] }],
        },
      ],
      order: [["tanggal", "DESC"]],
    });
    res.status(200).json({
      message: "Laporan transaksi berhasil diambil",
      data: transaksi,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil laporan transaksi",
      error: error.message,
    });
  }
};

exports.cetakLaporanTransaksi = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let tanggalFlter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      tanggalFlter = {
        tanggal: {
          [Op.between]: [start, end],
        },
      };
    }
    const transaksi = await Transaksi.findAll({
      where: tanggalFlter,
      include: [
        {
          model: Pengguna,
          attributes: ["nama", "email"],
        },
        {
          model: TransaksiItems,
          include: [{ model: Produk, attributes: ["nama", "harga"] }],
        },
      ],
      order: [["tanggal", "DESC"]],
    });
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=laporan-transaksi.pdf"
    // );
    res.setHeader(
      "Content-Disposition",
      "inline; filename=laporan-transaksi.pdf"
    );
    doc.pipe(res);
    const pageWidth = doc.page.width;
    const margin = 50;

    // Judul
    doc.fontSize(16).text("LAPORAN TRANSAKSI", margin, 57);

    // Teks kiri dan kanan sejajar (pada y = 100)
    const printedBy = `Dicetak oleh: ${req.user} `;
    const printedAt = `Dicetak pada: ${moment().format("LLL")}`;

    doc.fontSize(10).text(printedAt, margin, 100, 100);

    const printedByWidth = doc.widthOfString(printedBy);
    const rightX = pageWidth - margin - printedByWidth;
    doc.text(printedBy, rightX, 100);

    doc.text("", margin);
    doc.moveDown(2);

    transaksi.forEach((trx, index) => {
      doc.fontSize(11).text(`No. ${index + 1}`);
      doc.text(`Tanggal: ${moment(trx.tanggal).format("LL")}`);
      doc.text(`Pengguna: ${trx.Pengguna?.nama} (${trx.Pengguna?.email})`);
      doc.text(`Metode Bayar: ${trx.paymentMethod ? trx.paymentMethod : "-"}`);
      doc.text(`Status: ${trx.status}`);
      doc.moveDown(0.5);

      doc.text("Detail Produk:", { underline: true });
      trx.TransaksiItems.forEach((item) => {
        doc.text(
          `- ${item.Produk?.nama} | Qty: ${item.quantity} | Harga: Rp ${item.Produk?.harga} | Subtotal: Rp ${item.subtotal}`
        );
      });

      doc.text(`Total: Rp ${trx.total}`);
      doc.moveDown();
    });

    doc.text("-----------------------------------------------------");
    doc.text("PT. Mencari Cinta Sejati | Laporan Transaksi");

    doc.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mencetak laporan", error: err.message });
  }
};
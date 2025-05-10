const { Op } = require("sequelize");
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
      include: [{ model: TransaksiItems, include: ["Produk"] }],
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
      include: [{ model: TransaksiItems, include: ["Produk"] }],
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
    // const tanggalFlter =
    //   startDate && endDate
    //     ? {
    //         tanggal: { [Op.between]: [new Date(startDate), new Date(endDate)] },
    //       }
    //     : {};
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

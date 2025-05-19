const {
  keranjang,
  Produk,
  Transaksi,
  TransaksiItems,
} = require("../../models");

exports.getKeranjangByPengguna = async (req, res) => {
  try {
    const { penggunaId } = req.params;
    const dataKeranjang = await keranjang.findAll({
      where: { penggunaId },
      include: [{ model: Produk }],
    });
    return res
      .status(200)
      .json({ message: "Data keranjang ditemukan", data: dataKeranjang });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil keranjang", error: error.message });
  }
};

exports.createKeranjang = async (req, res) => {
  try {
    console.log("BODY:", req.body); 
    const { penggunaId, produkId, quantity } = req.body;

    const dataProduk = await Produk.findByPk(produkId);
    if (!dataProduk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const harga = dataProduk.harga;
    const stokTersedia = dataProduk.stok;

    const dataProdukYangTersedia = await keranjang.findOne({
      where: { penggunaId, produkId },
    });

    if (dataProdukYangTersedia) {
      const totalQuantity = dataProdukYangTersedia.quantity + quantity;
      if (totalQuantity > stokTersedia) {
        return res.status(400).json({
          message: `Stok tidak mencukupi. Maksimal: ${stokTersedia}`,
        });
      }

      dataProdukYangTersedia.quantity = totalQuantity;
      dataProdukYangTersedia.totalHarga = totalQuantity * harga;
      await dataProdukYangTersedia.save();

      dataProduk.stok = stokTersedia - quantity;
      await dataProduk.save();

      return res
        .status(200)
        .json({ message: "Quantity diperbarui", data: dataProdukYangTersedia });
    }

    if (quantity > stokTersedia) {
      return res.status(400).json({
        message: `Stok tidak mencukupi. Maksimal: ${stokTersedia}`,
      });
    }

    const totalHarga = quantity * harga;
    const dataKeranjangBaru = await keranjang.create({
      penggunaId,
      produkId,
      quantity,
      totalHarga,
    });

    dataProduk.stok = stokTersedia - quantity;
    await dataProduk.save();
    return res.status(201).json({
      message: "Produk ditambahkan ke keranjang",
      data: dataKeranjangBaru,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal menambahkan ke keranjang",
      error: error.message,
    });
  }
};

exports.updateKeranjang = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const dataKeranjang = await keranjang.findByPk(id);
    if (!dataKeranjang) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    const dataProduk = await Produk.findByPk(dataKeranjang.produkId);
    if (!dataProduk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const stockTersedia = dataProduk.stok;
    if (quantity > stockTersedia) {
      return res.status(400).json({
        message: `Stok tidak mencukupi. Maksimal: ${stockTersedia}`,
      });
    }

    dataProduk.stok = stockTersedia - quantity;
    await dataProduk.save();

    dataKeranjang.quantity = quantity;
    dataKeranjang.totalHarga = quantity * dataProduk.harga;
    await dataKeranjang.save();
    return res
      .status(200)
      .json({ message: "Item diperbarui", data: dataKeranjang });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal memperbarui item", error: error.message });
  }
};

exports.checkOutKeranjang = async (req, res) => {
  const { penggunaId } = req.body;
  try {
    const dataKeranjang = await keranjang.findAll({
      where: { penggunaId },
      include: [{ model: Produk }],
    });

    if (!dataKeranjang.length === 0) {
      return res.status(400).json({ message: "Keranjang kosong" });
    }
    let totalHarga = 0;
    for (const item of dataKeranjang) {
      totalHarga += item.totalHarga;
    }
    const tanggal = new Date();
    const transaksi = await Transaksi.create({
      penggunaId,
      tanggal,
      total: totalHarga,
    });

    for (const item of dataKeranjang) {
      await TransaksiItems.create({
        transaksiId: transaksi.id,
        produkId: item.produkId,
        quantity: item.quantity,
        subtotal: item.totalHarga,
      });
      //   const produk = await Produk.findByPk(item.produkId);
      //   produk.stok -= item.quantity;
      //   await produk.save();
    }

    await keranjang.destroy({
      where: { penggunaId },
    });
    return res.status(201).json({
      message: "Checkout berhasil",
      data: transaksi,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal melakukan checkout",
      error: error.message,
    });
  }
};

exports.deleteKeranjangItem = async (req, res) => {
  try {
    const { id } = req.params;
    const dataKeranjang = await keranjang.findByPk(id);
    if (!dataKeranjang)
      return res.status(404).json({ message: "Item tidak ditemukan" });

    const dataProduk = await Produk.findByPk(dataKeranjang.produkId);
    if (!dataProduk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const qty = dataKeranjang.quantity;
    dataProduk.stok = dataProduk.stok + qty;
    await dataProduk.save();

    await dataKeranjang.destroy();
    res.status(200).json({ message: "Item berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus item", error: error.message });
  }
};

exports.deleteKeranjangPerItem = async (req, res) => {
  try {
    const { id } = req.params;
    let decrementBy = 1;
    if (req.body.decrementBy !== undefined) {
      const parsed = parseInt(req.body.decrementBy, 10);
      if (isNaN(decrementBy) || decrementBy < 1) {
        return res
          .status(400)
          .json({ message: "decrementBy harus lebih >= 1" });
      }
      decrementBy = parsed;
    }

    const dataKeranjang = await keranjang.findByPk(id);
    if (!dataKeranjang) {
      return res
        .status(404)
        .json({ message: "Item keranjang tidak ditemukan" });
    }
    const dataProduk = await Produk.findByPk(dataKeranjang.produkId);
    if (!dataProduk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    const newQty = dataKeranjang.quantity - decrementBy;
    dataProduk.stok += decrementBy;
    await dataProduk.save();
    if (newQty > 0) {
      dataKeranjang.quantity = newQty;
      dataKeranjang.totalHarga = newQty * dataProduk.harga;
      await dataKeranjang.save();
      return res.status(200).json({
        message: `Quantity dikurangi ${decrementBy}`,
        data: dataKeranjang,
      });
    } else {
      await dataKeranjang.destroy();
      return res.status(200).json({
        message: "Item keranjang dihapus karena quantity 0",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal mengurangi quantity keranjang",
      error: error.message,
    });
  }
};

exports.clearKeranjang = async (req, res) => {
  try {
    const { penggunaId } = req.params;
    await keranjang.destroy({ where: { penggunaId } });
    res.status(200).json({ message: "Keranjang dikosongkan" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengosongkan keranjang", error: error.message });
  }
};

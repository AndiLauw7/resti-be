const { Produk, Kategori } = require("../../models");

exports.getAllProduk = async (req, res) => {
  try {
    const produk = await Produk.findAll({
      include: [{ model: Kategori }],
    });
    const dataProduk = produk;
    return res.status(200).json({ message: "data ditampilkan", dataProduk });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil produk", error: error.message });
  }
};

exports.getProdukById = async (req, res) => {
  try {
    const { id } = req.params;
    const produk = await Produk.findByPk(id, {
      include: [{ model: Kategori }],
    });
    if (!produk) {
      return res.status(400).json({ message: "data tidak ditemukan" });
    }
    const dataProduk = produk;
    return res
      .status(200)
      .json({ message: `data ditampilkan produk ke ${id}`, dataProduk });
  } catch (error) {
    res
      .status(500)
      .json({ message: `"Gagal mengambil produk"`, error: error.message });
  }
};

exports.createProduk = async (req, res) => {
  try {
    const { nama, kategoriId, harga, stok } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const dataProdukBaru = await Produk.create({
      nama,
      kategoriId,
      harga,
      stok,
      image,
    });

    const dataProduk = dataProdukBaru;
    return res.status(200).json({
      message: `data berhasil ditambahkan untuk produk ke `,
      dataProduk,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `"Gagal menambahkan produk"`, error: error.message });
  }
};

exports.updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kategoriId, harga, stok } = req.body;
    const dataUpdateProduk = await Produk.findByPk(id);

    if (!dataUpdateProduk) {
      return res.status(400).json({ message: "data tidak ditemukan" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const dataProduk = await Produk.update(
      {
        nama,
        kategoriId,
        harga,
        stok,
        image,
      },
      {
        where: { id },
      }
    );
    return res.status(200).json({
      message: `data berhasil diupdate untuk produk ke ${id}`,
      data: dataUpdateProduk,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `"Gagal mengupdate produk"`, error: error.message });
  }
};

exports.deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const produk = await Produk.findByPk(id, {
      include: [{ model: Kategori }],
    });
    if (!produk) {
      return res.status(400).json({ message: "data tidak ditemukan" });
    }
    const dataProduk = await Produk.destroy();
    return res.status(200).json({
      message: `data berhasil dihapus untuk produk ke ${id}`,
      dataProduk,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `"Gagal mengambil produk"`, error: error.message });
  }
};

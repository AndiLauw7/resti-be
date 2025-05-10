const { Kategori } = require("../../models");
exports.getAllKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findAll();
    const data = kategori;
    return res
      .status(200)
      .json({ message: "Menampilkan seluruh data Kategori", data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil data kategori", error: err.message });
  }
};

exports.getKategoriById = async (req, res) => {
  try {
    const { id } = req.params;
    const kategori = await Kategori.findByPk(id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    const databyId = kategori;
    return res
      .status(200)
      .json({ message: `Menampilkan data Kategori by${id}`, databyId });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil kategori", error: err.message });
  }
};

exports.createKategori = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    const tambahKategoriBaru = await Kategori.create({ nama, deskripsi });
    return res
      .status(201)
      .json({ message: "Berhasil Menambahkan Data", tambahKategoriBaru });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal menambahkan kategori", error: err.message });
  }
};

exports.updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;
    const kategori = await Kategori.findByPk(id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    const dataUpdate = await kategori.update({ nama, deskripsi });

    return res.status(200).json({ message: "Error saat mengubah", dataUpdate });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengubah kategori", error: err.message });
  }
};

exports.deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const kategori = await Kategori.findByPk(id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    const hapusData = await kategori.destroy();
    return res
      .status(200)
      .json({ message: `Kategori dengan ${id} berhasil dihapus` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus kategori", error: err.message });
  }
};

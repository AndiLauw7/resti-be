const { Pengguna } = require("../../models");
const { generateToken } = require("../utils/generateToken");
const {
  hashingPassrowd,
  comparePassword,
} = require("../utils/hashingPassword");
exports.registerPengguna = async (req, res) => {
  try {
    const { nama, email, alamat, nohp, image, password, role } = req.body;
    if (!email || !password || !nama) {
      return res
        .status(400)
        .json({ message: "Nama, email, dan password wajib diisi" });
    }
    const cekPengguna = await Pengguna.findOne({ where: { email } });
    if (cekPengguna) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    const hashedPassword = await hashingPassrowd(password);
    const users = await Pengguna.create({
      nama,
      email,
      alamat,
      nohp,
      image,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "Registrasi berhasil", data: users });
  } catch (error) {
    res.status(500).json({ message: "Gagal register", error: error.message });
  }
};

exports.loginPengguna = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password harus diisi" });
    }
    const user = await Pengguna.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }
    const cocokPassword = await comparePassword(password, user.password);
    if (!cocokPassword) {
      return res.status(401).json({ message: "Email dan Password Salah" });
    }
    const token = await generateToken({ id: user.id, role: user.role });
    return res.status(200).json({
      message: "Login Berhasil",
      token,
      role: user.role,
      pengguna: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        alamat: user.alamat,
        nohp: user.nohp,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Terjadi kesalahan server", error: error });
  }
};

exports.getAllPengguna = async (req, res) => {
  try {
    const user = await Pengguna.findAll({
      attributes: { exclude: ["password"] },
    });
    return res
      .status(200)
      .json({ message: "Data semua pengguna ditampilkan", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal menemukan data", error: error.message });
  }
};

exports.getPenggunaByd = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Pengguna.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    return res
      .status(200)
      .json({ message: `Data pengguna dengan ${id} ditampilkan`, data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal menemukan data", error: error.message });
  }
};

exports.updatePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, alamat, nohp, role } = req.body;
    const user = await Pengguna.findByPk(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const dataUpdate = await user.update(
      {
        nama,
        email,
        alamat,
        nohp,
        image,
        role,
      },
      { where: { id } }
    );
    return res
      .status(200)
      .json({ message: "User berhasil diupdate", dataUpdate: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal update user", error: error.message });
  }
};

exports.deletePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Pengguna.findByPk(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    await user.destroy();
    return res.status(200).json({ message: `User berhasil dihapus ${id}` });
  } catch (error) {
    res.status(500).json({ message: "Gagal hapus user", error: error.message });
  }
};

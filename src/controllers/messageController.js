const { message: Message, Pengguna } = require("../../models");
const { Op } = require("sequelize");
exports.sendMessage = async (req, res) => {
  try {
    const sendId = req.user.id;
    const { receiveId, content } = req.body;
    if (!sendId || !receiveId || !content) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const receiver = await Pengguna.findByPk(receiveId);
    if (!receiver) {
      return res.status(404).json({ message: "Penerima tidak ditemukan" });
    }

    const message = await Message.create({
      sendId,
      receiveId,
      content,
    });

    return res.status(201).json({
      msg: "Pesan berhasil dikirim",
      data: message,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Terjadi kesalahan" });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.query;
    if (!userId || !partnerId) {
      return res
        .status(400)
        .json({ message: "Pengguna dan partner/penerima tidak valid" });
    }

    // const user = await Pengguna.findByPk(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "Pengguna tidak valid" });
    // }
    const partner = await Pengguna.findByPk(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner tidak valid" });
    }
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sendId: userId, receiveId: partnerId },
          // { receiveId: partnerId },
          { sendId: partnerId, receiveId: userId },
        ],
      },
      include: [
        { model: Pengguna, as: "Sender", attributes: ["id", "nama"] },
        { model: Pengguna, as: "Receiver", attributes: ["id", "nama"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res
      .status(200)
      .json({ message: "Berhasil mengambil pesan", data: messages });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
};

exports.getChatPartners = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sendId: userId }, { receiveId: userId }],
      },
      include: [
        { model: Pengguna, as: "Sender", attributes: ["id", "nama"] },
        { model: Pengguna, as: "Receiver", attributes: ["id", "nama"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ambil partner unik
    const partners = [];
    const partnerIds = new Set();

    messages.forEach((msg) => {
      const partner = msg.sendId === userId ? msg.Receiver : msg.Sender;
      if (partner && !partnerIds.has(partner.id)) {
        partnerIds.add(partner.id);
        partners.push(partner);
      }
    });

    return res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
};

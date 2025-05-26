const { Transaksi, TransaksiItems, Pengguna, Produk } = require("../../models");
const core = require("../utils/midtrans");

exports.createMidtransTransaksi = async (req, res) => {
  const { transaksiId } = req.body;
  try {
    const dataTransaksi = await Transaksi.findByPk(transaksiId, {
      include: [{ model: TransaksiItems }, { model: Pengguna }],
    });
    if (!dataTransaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    if (dataTransaksi.status === "paid") {
      return res.status(400).json({ message: "Transaksi sudah dibayar" });
    }
    if (dataTransaksi.status === "failed") {
      return res.status(400).json({
        message:
          "Transaksi sudah kadaluarsa, lakukan pemesanan dan transaksi ulang",
      });
    }
    const orderId = `ORDER-${dataTransaksi.id}-${Date.now()}`;
    const parameter = {
      transaction_details: {
        // order_id: `ORDER-${dataTransaksi.id}-${Date.now()}`,
        order_id: orderId,
        gross_amount: Number(dataTransaksi.total),
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: dataTransaksi.Pengguna.nama,
        email: dataTransaksi.Pengguna.email,
        phone: dataTransaksi.Pengguna.nohp,
        address: dataTransaksi.Pengguna.alamat,
      },
    };
    const transaction = await core.createTransaction(parameter);
    dataTransaksi.paymentUrl = transaction.redirect_url;
    dataTransaksi.midtransOrderId = orderId;
    dataTransaksi.paymentMethod = "midtrans";
    await dataTransaksi.save();
    return res.status(200).json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuat Midtrans transaction",
      error: error.message,
    });
  }
};

exports.handleNotifications = async (req, res) => {
  try {
    const notification = req.body;
    // const notification = JSON.parse(req.body.toString("utf8"));
    console.log("Data dari Midtrans:", req.body);
    console.log("📨 Midtrans Notification Received:", notification);
    const orderId = notification.order_id;
    if (!orderId || typeof orderId !== "string") {
      console.warn("⚠️ order_id tidak tersedia atau bukan string:", orderId);
      return res
        .status(400)
        .json({ message: "Invalid order_id in notification" });
    }

    // const [, id] = orderId.split("-");
    const parts = orderId.split("-");
    if (parts.length < 2) {
      console.warn("⚠️ Format order_id tidak sesuai:", orderId);
      return res.status(400).json({ message: "order_id format is invalid" });
    }

    const id = parts[1];
    let newStatus;
    switch (notification.transaction_status) {
      case "capture":
      case "settlement":
        newStatus = "paid";
        break;
      case "cancel":
      case "deny":
      case "expire":
        newStatus = "failed";
        break;
      case "pending":
      default:
        newStatus = "pending";
    }
    console.log(`📝 Updating transaksi #${id} to status: ${newStatus}`);
    await Transaksi.update(
      { status: newStatus },
      { where: { id: parseInt(id, 10) } }
    );

    if (newStatus === "failed") {
      console.log("🔄 Transaksi gagal, mengembalikan stok...");
      const dataTransaksi = await Transaksi.findByPk(id, {
        include: [{ model: TransaksiItems }],
      });
      if (!dataTransaksi) {
        console.warn(`⚠️ Transaksi ID ${id} tidak ditemukan`);
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }
      for (const item of dataTransaksi.TransaksiItems) {
        const dataProduk = await Produk.findByPk(item.produkId);
        if (dataProduk) {
          console.log(
            `↩️ Mengembalikan stok produk ID ${item.produkId}: +${item.quantity}`
          );
          console.log(
            `Stok lama: ${dataProduk.stok}, akan ditambah: ${item.quantity}`
          );
          dataProduk.stok += item.quantity;
          await dataProduk.save();
          console.log(`Stok baru setelah update: ${dataProduk.stok}`);
        } else {
          console.warn(`⚠️ Produk ID ${item.produkId} tidak ditemukan`);
        }
      }
    }
    return res.status(200).json({ message: "OK" });
    // return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error Midtrans notification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const axios = require("axios");
const base64 = require("base-64");

exports.autoSyncPendingTransactions = async () => {
  try {
    const pendingTransaksis = await Transaksi.findAll({
      where: { status: "pending", paymentMethod: "midtrans" },
    });

    if (pendingTransaksis.length === 0) {
      console.log("✅ Tidak ada transaksi pending");
      return;
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    for (const transaksi of pendingTransaksis) {
      // const orderId =
      //   transaksi.paymentUrl?.match(/ORDER-\d+-\d+/)?.[0] ||
      //   `ORDER-${transaksi.id}`;
      const orderId = transaksi.midtransOrderId;
      if (!orderId) {
        console.warn(
          `⚠️ Transaksi #${transaksi.id} tidak punya midtransOrderId`
        );
        continue;
      }

      try {
        const response = await axios.get(
          `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
          {
            headers: {
              Authorization: "Basic " + base64.encode(serverKey + ":"),
              "Content-Type": "application/json",
            },
          }
        );

        const status = response.data.transaction_status;
        let newStatus;
        switch (status) {
          case "settlement":
          case "capture":
            newStatus = "paid";
            break;
          case "cancel":
          case "deny":
          case "expire":
            newStatus = "failed";
            break;
          case "pending":
          default:
            newStatus = "pending";
        }

        if (transaksi.status !== newStatus) {
          console.log(
            `🔄 Update transaksi #${transaksi.id}: ${transaksi.status} ➡️ ${newStatus}`
          );
          await transaksi.update({ status: newStatus });

          if (newStatus === "failed") {
            const detail = await Transaksi.findByPk(transaksi.id, {
              include: [{ model: TransaksiItems }],
            });

            for (const item of detail.TransaksiItems) {
              const produk = await Produk.findByPk(item.produkId);
              if (produk) {
                produk.stok += item.quantity;
                await produk.save();
                console.log(
                  `↩️ Kembalikan stok produk #${item.produkId}: +${item.quantity}`
                );
              }
            }
          }
        }
      } catch (err) {
        console.error(
          `❌ Gagal cek status transaksi #${transaksi.id}:`,
          err.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Error sinkronisasi otomatis:", error.message);
  }
};

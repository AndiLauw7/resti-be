const { message: Message } = require("../../models");
module.exports = (io, socket) => {
  // ini untuk menangani room chat berdasarkan id
  socket.on("joinRoom", (userId) => {
    // socket.join(userId);
    socket.join(userId.toString());
    console.log(`User ${userId} joined room ${userId}`);
  });
  socket.on("sendMessage", async (data) => {
    const { sendId, receiveId, content } = data;
    console.log("sendMessage received:", data);
    // io.to(receiveId).emit("receiveMessage", {
    //   senderId: socket.id,
    //   content: content,
    // });
    try {
      // Simpan pesan ke DB
      const message = await Message.create({
        sendId,
        receiveId,
        content,
      });

      // Broadcast ke pengirim (biar langsung muncul di chat sender)
      io.to(sendId.toString()).emit("receiveMessage", message);

      // Broadcast ke penerima
      io.to(receiveId.toString()).emit("receiveMessage", message);

      console.log(`Pesan dari ${sendId} ke ${receiveId}: ${content}`);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
  socket.on("leaveRoom", (userId) => {
    // socket.leave(userId);
    socket.leave(userId.toString());
    console.log(`User ${userId} left room ${userId}`);
  });
  socket.on("chat message", (msg) => {
    console.log("Pesan dari FE:", msg);
    // socket.emit("test-response", "Pesan diterima di BE 👍");
    io.emit("chat message", msg);
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

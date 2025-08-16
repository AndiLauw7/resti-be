module.exports = (io, socket) => {
  // ini untuk menangani room chat berdasarkan id
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });
  socket.on("sendMessage", (data) => {
    const { receiveId, message } = data;
    io.to(receiveId).emit("receiveMessage", {
      senderId: socket.id,
      message: message,
    });
  });
  socket.on("leaveRoom", (userId) => {
    socket.leave(userId);
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

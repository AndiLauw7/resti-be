const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./src/middlewares/socketHandler.js");
const cron = require("node-cron");
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

console.log("Routes terdaftar...");

io.on("connection", (socket) => {
  socketHandler(io, socket);
});

app.use(cors());
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Jalan");
});

const PORT = process.env.PORT || 5000;

const router = require("./src/routes/index.js");
const {
  autoSyncPendingTransactions,
} = require("./src/controllers/paymentController.js");
cron.schedule("*/1 * * * *", () => {
  // console.log("[CRON] Mengecek transaksi pending...");
  autoSyncPendingTransactions();
});

app.use("/api/v1", router);
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.listen(PORT, () => {
//   console.log(`Server jalan di port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});



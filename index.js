const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./config/config.json");
const path = require("path");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Jalan");
});

const PORT = process.env.PORT || 5000;

const router = require("./src/routes/index.js");


app.use("/api/v1", router);
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});

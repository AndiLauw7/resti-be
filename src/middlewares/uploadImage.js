const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqe = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqe);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("File hanya boleh gambar(png,jpg,jpeg,gif)"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;

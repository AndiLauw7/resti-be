const jwt = require("jsonwebtoken");
exports.generateToken = async (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "defaultSecret", {
    expiresIn: "1d",
  });
};

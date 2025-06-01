const jwt = require("jsonwebtoken");

exports.verifikasiToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
   console.log("Received Token:", token);
   if (!token)
     return res.status(401).json({ message: "Unauthorized Token Not Yet" });
   try {
     const decode = jwt.verify(token, process.env.JWT_SECRET);
     console.log("Decoded JWT:", decode);
     req.user = decode;
     next();
   } catch (error) {
     console.error("JWT error:", error.message);
     return res.status(403).json({ message: "Invalid Token" });
   }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya admin yang diperbolehkan." });
  }
  next();
};

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🟠 Gelen Token Header:", authHeader); // Token var mı kontrol et

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Token eksik veya Bearer değil!");
    return res.status(401).json({ message: "Token bulunamadı veya geçersiz!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token başarıyla çözüldü:", decoded); // Kullanıcı bilgisi gelmeli
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token geçersiz:", error);
    return res.status(401).json({ message: "Token geçersiz!" });
  }
};

module.exports = verifyToken;

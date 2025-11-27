const jwt = require("jsonwebtoken");

// Kiểm tra đã đăng nhập chưa
exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]; // Lấy token từ header
  if (!token) return res.status(403).json({ message: "Không có quyền truy cập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key_2025");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Kiểm tra có phải Admin không
exports.verifyAdmin = (req, res, next) => {
  // verifyToken phải chạy trước để có req.user
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ Admin mới được thực hiện thao tác này!" });
  }
  next();
};
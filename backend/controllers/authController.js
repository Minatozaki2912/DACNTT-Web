const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔑 Đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation cơ bản
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: "Tên đăng nhập từ 3-20 ký tự"});
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: "Tên đăng nhập chỉ chứa chữ, số và gạch dưới" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải ít nhất 6 ký tự" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    // Kiểm tra tồn tại
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      const msg = existing.username === username 
        ? "Tên đăng nhập đã tồn tại" 
        : "Email đã được sử dụng";
      return res.status(400).json({ message: msg });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "Đăng ký thành công! Hãy đăng nhập nhé 🎉" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 🔐 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Admin." 
      });
    }
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // --- SỬA CHỖ NÀY ---
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role // <--- THÊM: Lưu quyền vào token
      },
      process.env.JWT_SECRET || "fallback_secret_key_2025",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role // <--- THÊM: Gửi quyền về cho Frontend xử lý chuyển trang
      }
    });
    // -------------------

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// 👥 Lấy danh sách tất cả Users (Chỉ Admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Lấy tất cả user nhưng trừ trường password ra
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách user" });
  }
};

// 🔒 Khóa / Mở khóa tài khoản
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Đảo ngược trạng thái (đang khóa -> mở, đang mở -> khóa)
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: "Cập nhật thành công", isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật user" });
  }
};
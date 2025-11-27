const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, default: "user", enum: ["user", "admin"] }, // Đã có từ bước trước
  
  phone:    { type: String, default: "" }, // Để liên hệ giao hàng
  address:  { type: String, default: "" }, // Địa chỉ giao hàng
  isBlocked:{ type: Boolean, default: false }, // Admin có thể khóa tài khoản này
  
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
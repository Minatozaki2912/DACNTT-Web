// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, default: "user", enum: ["user", "admin"] },
  isBlocked:{ type: Boolean, default: false },

  fullName: { type: String, default: "" },
  phone:    { type: String, default: "" },
  address:  { type: String, default: "" },
  avatar:   { type: String, default: "https://i.imgur.com/6VBx3io.png" }, // Ảnh mặc định
  // ------------------------------------

  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
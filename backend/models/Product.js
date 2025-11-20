const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  brand: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 🔍 tạo chỉ mục text cho tìm kiếm thông minh
productSchema.index(
  { name: "text", category: "text", description: "text" },
  { weights: { name: 10, category: 5, description: 2 } }
);

module.exports = mongoose.model("Product", productSchema);

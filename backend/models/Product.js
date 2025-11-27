const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: "" }, // Thêm mô tả
  image:       { type: String, required: true }, 
  category:    { type: String, required: true },
  
  price:       { type: Number, required: true, min: 0 },
  originalPrice: { type: Number }, // Giá gốc (để hiện giảm giá nếu cần)
  
  quantity:    { type: Number, required: true, default: 0 }, // QUAN TRỌNG: Quản lý kho
  sold:        { type: Number, default: 0 }, // Đếm số lượng đã bán chạy
  
  status:      { type: String, default: "active", enum: ["active", "hidden"] }, // Ẩn sản phẩm mà không cần xóa
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
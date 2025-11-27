const express = require("express");
const router = express.Router();
// 1. Import đủ 6 hàm từ controller
const { 
  searchProducts, 
  suggest, 
  categories,
  createProduct,  // <--- THÊM
  updateProduct,  // <--- THÊM
  deleteProduct   // <--- THÊM
} = require("../controllers/productController");

const Product = require("../models/Product");

// 2. Import Middleware bảo vệ (để chặn người lạ xóa đồ)
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware"); 

// --- PUBLIC ROUTES (Ai cũng xem được) ---
router.get("/search", searchProducts);
router.get("/suggest", suggest);
router.get("/categories", categories);

// Danh sách mặc định
router.get("/", async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 }).limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tải danh sách sản phẩm" });
  }
});

// --- ADMIN ROUTES (Phải là Admin mới dùng được) ---
// Thêm sản phẩm
router.post("/", verifyToken, verifyAdmin, createProduct);

// Sửa sản phẩm (cần ID)
router.put("/:id", verifyToken, verifyAdmin, updateProduct);

// Xóa sản phẩm (cần ID)
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

module.exports = router;
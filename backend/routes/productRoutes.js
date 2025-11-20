const express = require("express");
const router = express.Router();
const { searchProducts, suggest, categories } = require("../controllers/productController");
const Product = require("../models/Product");

router.get("/search", searchProducts);
router.get("/suggest", suggest);
router.get("/categories", categories);

// danh sách mặc định
router.get("/", async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 }).limit(20);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tải danh sách sản phẩm" });
  }
});

module.exports = router;

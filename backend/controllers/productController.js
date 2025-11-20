const Product = require("../models/Product");

// 📦 API: Tìm kiếm nâng cao
exports.searchProducts = async (req, res) => {
  try {
    const { q = "", category, minPrice, maxPrice, sort = "relevance", page = 1, pageSize = 12 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);
    let sortOption = {};

    // tìm theo text
    if (q.trim()) {
      filter.$text = { $search: q };
      query = Product.find(filter, { score: { $meta: "textScore" } });
      sortOption = { score: { $meta: "textScore" } };
    }

    // sắp xếp
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const pageNum = parseInt(page);
    const sizeNum = parseInt(pageSize);

    const [items, total] = await Promise.all([
      query.sort(sortOption).skip((pageNum - 1) * sizeNum).limit(sizeNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / sizeNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tìm kiếm sản phẩm" });
  }
};

// ✨ Gợi ý tự động (autocomplete)
exports.suggest = async (req, res) => {
  try {
    const { q = "" } = req.query;
    if (!q.trim()) return res.json([]);
    const regex = new RegExp("^" + q.trim(), "i");
    const items = await Product.find({ name: { $regex: regex } })
      .select("name category _id")
      .limit(8);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi gợi ý sản phẩm" });
  }
};

// 🧩 Danh sách danh mục
exports.categories = async (req, res) => {
  try {
    const cats = await Product.distinct("category", { category: { $ne: null } });
    res.json(cats.sort());
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh mục" });
  }
};

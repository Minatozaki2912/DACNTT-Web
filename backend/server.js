// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({ origin: "*" })); // Cho phép frontend localhost:5173 gọi
app.use(express.json());        // Parse JSON body

// ==================== KẾT NỐI MONGODB ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ==================== ROUTES ====================

// 1. AUTH ROUTES – ĐÃ ĐÚNG ĐỂ VITE PROXY HOẠT ĐỘNG MƯỢT
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);   // → /api/auth/register & /api/auth/login

// 2. PRODUCT ROUTES
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// (Tùy chọn) Serve frontend khi deploy cùng backend (Vercel, Render, Railway...)
// Uncomment khi deploy production
/*
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
);
*/
// 3. USER ROUTES (Quản lý người dùng)
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 API Auth     → http://localhost:${PORT}/api/auth`);
  console.log(`📍 API Products → http://localhost:${PORT}/api/products`);
});
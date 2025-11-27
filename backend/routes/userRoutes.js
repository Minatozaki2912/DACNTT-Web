const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ==========================================
// 1. CÁC ROUTE CÁ NHÂN (USER TỰ QUẢN LÝ)
// ==========================================

// Lấy thông tin cá nhân: GET /api/users/profile
router.get("/profile", verifyToken, authController.getProfile); 

// Cập nhật thông tin: PUT /api/users/profile
router.put("/profile", verifyToken, authController.updateProfile);


// ==========================================
// 2. CÁC ROUTE ADMIN (QUẢN LÝ USER KHÁC)
// ==========================================

// Lấy danh sách user: GET /api/users
router.get("/", verifyToken, verifyAdmin, authController.getAllUsers);

// Khóa/Mở user: PUT /api/users/block/:id
router.put("/block/:id", verifyToken, verifyAdmin, authController.toggleBlockUser);

module.exports = router;
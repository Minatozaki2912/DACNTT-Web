const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// QUAN TRỌNG: Các route này cần bảo vệ bằng verifyToken và verifyAdmin

// 1. Lấy danh sách user: GET /api/users
router.get("/", verifyToken, verifyAdmin, authController.getAllUsers);

// 2. Khóa/Mở user: PUT /api/users/block/:id
router.put("/block/:id", verifyToken, verifyAdmin, authController.toggleBlockUser);

module.exports = router;
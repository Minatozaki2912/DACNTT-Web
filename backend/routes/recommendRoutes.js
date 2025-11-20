const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../controllers/recommendController");

router.get("/:id", getRecommendations);

module.exports = router;

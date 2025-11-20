const fs = require("fs");
const path = require("path");

exports.getRecommendations = (req, res) => {
  const id = parseInt(req.params.id);
  const dataPath = path.join(__dirname, "../models/Product.json");
  const products = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const current = products.find(p => p.id === id);
  const recs = products.filter(p => p.category === current.category && p.id !== id);
  res.json(recs);
};

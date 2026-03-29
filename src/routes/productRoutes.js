const express = require("express");
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateStock
} = require("../controllers/productController");

const router = express.Router();

router.get("/", listProducts);
router.get("/:productId", getProduct);
router.post("/", createProduct);
router.put("/:productId", updateProduct);
router.patch("/:productId/stock", updateStock);

module.exports = router;

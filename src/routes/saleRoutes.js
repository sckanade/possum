const express = require("express");
const {
  listSales,
  getSale,
  createSale
} = require("../controllers/saleController");

const router = express.Router();

router.get("/", listSales);
router.get("/:saleId", getSale);
router.post("/", createSale);

module.exports = router;

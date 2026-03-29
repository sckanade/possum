const express = require("express");
const dashboardRoutes = require("./dashboardRoutes");
const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const saleRoutes = require("./saleRoutes");
const profileRoutes = require("./profileRoutes");
const reportRoutes = require("./reportRoutes");

const router = express.Router();

router.use("/dashboard", dashboardRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/sales", saleRoutes);
router.use("/profile", profileRoutes);
router.use("/reports", reportRoutes);

module.exports = router;

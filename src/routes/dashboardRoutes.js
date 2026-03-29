const express = require("express");
const {
  getTodaySales,
  getWeeklySales,
  getForecast
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/today", getTodaySales);
router.get("/weekly", getWeeklySales);
router.get("/forecast", getForecast);

module.exports = router;

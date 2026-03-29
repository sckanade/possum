const express = require("express");
const { exportReport } = require("../controllers/reportController");

const router = express.Router();

router.post("/export/google-drive", exportReport);

module.exports = router;

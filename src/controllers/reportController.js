const { Sale } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { exportFinancialReport } = require("../services/googleDriveService");

const exportReport = asyncHandler(async (req, res) => {
  const period = req.body.period || "monthly";

  const sales = await Sale.findAll({
    order: [["soldAt", "DESC"]]
  });

  const result = await exportFinancialReport({
    period,
    sales
  });

  res.json(result);
});

module.exports = {
  exportReport
};

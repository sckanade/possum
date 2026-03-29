async function exportFinancialReport({ period, sales }) {
  return {
    exported: false,
    message: "Google Drive export belum diimplementasikan. Hubungkan service account terlebih dahulu.",
    meta: {
      period,
      totalRecords: sales.length
    }
  };
}

module.exports = {
  exportFinancialReport
};

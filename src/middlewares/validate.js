const AppError = require("../utils/appError");

function validateRequired(fields, payload) {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");

  if (missing.length > 0) {
    throw new AppError(400, "Missing required fields", { missing });
  }
}

module.exports = {
  validateRequired
};

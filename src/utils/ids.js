const { randomUUID } = require("crypto");

function prefixedId(prefix) {
  return `${prefix}-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

function invoiceNumber() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");

  return `INV-${stamp}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

module.exports = {
  prefixedId,
  invoiceNumber
};

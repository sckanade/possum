const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Sale = sequelize.define("Sale", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceNumber: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    soldAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "transfer", "ewallet"),
      allowNull: false,
      defaultValue: "cash"
    }
  });

  return Sale;
};

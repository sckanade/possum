const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SaleItem = sequelize.define("SaleItem", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  });

  return SaleItem;
};

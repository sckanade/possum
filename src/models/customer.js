const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Customer = sequelize.define("Customer", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    whatsappOptIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Customer;
};

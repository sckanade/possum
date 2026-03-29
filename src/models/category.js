const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Category = sequelize.define("Category", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  });

  return Category;
};

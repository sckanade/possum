const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StoreProfile = sequelize.define("StoreProfile", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    storeId: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true
    },
    storeName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    logoUrl: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  });

  return StoreProfile;
};

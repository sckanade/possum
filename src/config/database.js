const { Sequelize } = require("sequelize");
const { db, nodeEnv } = require("./env");

const sequelize = new Sequelize(db.name, db.user, db.password, {
  host: db.host,
  port: db.port,
  dialect: "postgres",
  logging: db.logging ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: true
  },
  dialectOptions: nodeEnv === "production" ? { ssl: { require: true, rejectUnauthorized: false } } : {}
});

module.exports = sequelize;

const app = require("./app");
const { port } = require("./config/env");
const sequelize = require("./config/database");
require("./models");

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(port, () => {
      console.log(`Possum backend listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Possum backend:", error);
    process.exit(1);
  }
}

startServer();

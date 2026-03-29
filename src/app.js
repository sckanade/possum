const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiPrefix } = require("./config/env");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "possum-backend",
    timestamp: new Date().toISOString()
  });
});

app.use(apiPrefix, routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

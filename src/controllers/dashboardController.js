const { Op, fn, col, literal } = require("sequelize");
const { Sale } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { startOfDay, endOfDay, startOfWeek } = require("../utils/date");
const { forecastSeries } = require("../utils/forecast");

const getTodaySales = asyncHandler(async (_req, res) => {
  const start = startOfDay();
  const end = endOfDay();

  const sales = await Sale.findAll({
    where: {
      soldAt: {
        [Op.between]: [start, end]
      }
    },
    attributes: [
      [literal("EXTRACT(HOUR FROM sold_at)"), "hour"],
      [fn("sum", col("total")), "totalSales"]
    ],
    group: [literal("hour")],
    order: [literal("hour ASC")]
  });

  res.json({
    date: start.toISOString(),
    hourlySales: sales.map((item) => ({
      hour: Number(item.get("hour")),
      totalSales: Number(item.get("totalSales"))
    }))
  });
});

const getWeeklySales = asyncHandler(async (_req, res) => {
  const start = startOfDay();
  start.setDate(start.getDate() - 6);
  const end = endOfDay();

  const sales = await Sale.findAll({
    where: {
      soldAt: {
        [Op.between]: [start, end]
      }
    },
    attributes: [
      [literal("DATE_TRUNC('day', sold_at)"), "day"],
      [fn("sum", col("total")), "totalSales"]
    ],
    group: [literal("day")],
    order: [literal("day ASC")]
  });

  const salesMap = new Map(
    sales.map((item) => [
      new Date(item.get("day")).toISOString().slice(0, 10),
      Number(item.get("totalSales"))
    ])
  );

  const dailySales = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const isoDate = date.toISOString().slice(0, 10);

    dailySales.push({
      day: `${isoDate}T00:00:00.000Z`,
      totalSales: salesMap.get(isoDate) || 0
    });
  }

  res.json({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    dailySales
  });
});

const getForecast = asyncHandler(async (_req, res) => {
  const windowStart = startOfDay();
  windowStart.setDate(windowStart.getDate() - 6);

  const recentSales = await Sale.findAll({
    where: {
      soldAt: {
        [Op.gte]: windowStart
      }
    },
    attributes: [
      [literal("DATE_TRUNC('day', sold_at)"), "day"],
      [fn("sum", col("total")), "totalSales"]
    ],
    group: [literal("day")],
    order: [literal("day ASC")]
  });

  const historyMap = new Map(
    recentSales.map((sale) => [
      new Date(sale.get("day")).toISOString().slice(0, 10),
      Number(sale.get("totalSales"))
    ])
  );

  const history = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(windowStart);
    date.setDate(windowStart.getDate() + index);
    const isoDate = date.toISOString().slice(0, 10);

    history.push({
      date: isoDate,
      totalSales: historyMap.get(isoDate) || 0
    });
  }

  const values = history.map((entry) => entry.totalSales);
  const result = forecastSeries(values, 5);
  const forecast = result.forecast.map((entry, index) => {
    const date = new Date(windowStart);
    date.setDate(windowStart.getDate() + history.length + index);

    return {
      step: entry.step,
      date: date.toISOString().slice(0, 10),
      predictedValue: entry.predictedValue
    };
  });

  res.json({
    basedOnRecords: history.filter((entry) => entry.totalSales > 0).length,
    history,
    model: {
      slope: result.slope,
      intercept: result.intercept
    },
    forecast
  });
});

module.exports = {
  getTodaySales,
  getWeeklySales,
  getForecast
};

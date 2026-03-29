function linearRegression(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return { slope: 0, intercept: 0 };
  }

  const n = points.length;
  const sumX = points.reduce((total, point) => total + point.x, 0);
  const sumY = points.reduce((total, point) => total + point.y, 0);
  const sumXY = points.reduce((total, point) => total + point.x * point.y, 0);
  const sumXX = points.reduce((total, point) => total + point.x * point.x, 0);
  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) {
    return {
      slope: 0,
      intercept: sumY / n
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function forecastSeries(values, futureSteps = 3) {
  const points = values.map((value, index) => ({
    x: index,
    y: Number(value) || 0
  }));

  const { slope, intercept } = linearRegression(points);
  const forecast = [];

  for (let step = 0; step < futureSteps; step += 1) {
    const x = values.length + step;
    const y = Math.max(0, slope * x + intercept);
    forecast.push({
      step: x,
      predictedValue: Number(y.toFixed(2))
    });
  }

  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4)),
    forecast
  };
}

module.exports = {
  linearRegression,
  forecastSeries
};

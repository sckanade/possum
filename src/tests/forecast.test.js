const { linearRegression, forecastSeries } = require("../utils/forecast");

describe("forecast utilities", () => {
  test("computes slope and intercept", () => {
    const result = linearRegression([
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 30 }
    ]);

    expect(result.slope).toBe(10);
    expect(result.intercept).toBe(10);
  });

  test("creates non-negative forecast output", () => {
    const result = forecastSeries([100, 120, 140], 2);

    expect(result.forecast).toHaveLength(2);
    expect(result.forecast[0].predictedValue).toBeGreaterThanOrEqual(0);
  });
});

import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import MetricTile from "../components/MetricTile";
import {
  getForecast,
  getTodaySales,
  getWeeklySales
} from "../services/dashboardApi";
import { formatCurrency, formatShortDate } from "../lib/format";

function BarChart({ items, labelKey, valueKey }) {
  const max = items.reduce(
    (highest, item) => Math.max(highest, Number(item[valueKey] || 0)),
    0
  );

  return (
    <div className="bar-chart">
      {items.map((item) => {
        const value = Number(item[valueKey] || 0);
        const width = max === 0 ? 0 : (value / max) * 100;

        return (
          <div className="bar-chart__row" key={`${item[labelKey]}-${value}`}>
            <span>{item[labelKey]}</span>
            <div className="bar-chart__track">
              <div className="bar-chart__fill" style={{ width: `${width}%` }} />
            </div>
            <strong>{formatCurrency(value)}</strong>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ actual, forecast }) {
  const points = [
    ...actual.map((entry) => ({
      label: formatShortDate(entry.date),
      value: Number(entry.totalSales || 0),
      type: "actual"
    })),
    ...forecast.map((entry) => ({
      label: formatShortDate(entry.date),
      value: Number(entry.predictedValue || 0),
      type: "forecast"
    }))
  ];

  if (!points.length) {
    return <p className="muted">Belum ada data untuk divisualisasikan.</p>;
  }

  const width = 640;
  const height = 260;
  const padding = 28;
  const max = Math.max(...points.map((point) => point.value), 1);
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const coordinates = points.map((point, index) => {
    const x = padding + stepX * index;
    const y = height - padding - (point.value / max) * (height - padding * 2);
    return { ...point, x, y };
  });

  const actualCoordinates = coordinates.slice(0, actual.length);
  const forecastCoordinates =
    actual.length > 0
      ? [coordinates[Math.max(actual.length - 1, 0)], ...coordinates.slice(actual.length)]
      : coordinates;

  const actualPath = actualCoordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const forecastPath = forecastCoordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Forecast chart">
        <defs>
          <linearGradient id="actualGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffcf77" />
            <stop offset="100%" stopColor="#ff8d63" />
          </linearGradient>
          <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8ecbff" />
            <stop offset="100%" stopColor="#7cffc1" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = height - padding - tick * (height - padding * 2);
          return (
            <line
              key={tick}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="6 6"
            />
          );
        })}

        {actualPath ? (
          <path
            d={actualPath}
            fill="none"
            stroke="url(#actualGradient)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        ) : null}

        {forecastPath ? (
          <path
            d={forecastPath}
            fill="none"
            stroke="url(#forecastGradient)"
            strokeDasharray="8 8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        ) : null}

        {coordinates.map((point) => (
          <circle
            key={`${point.label}-${point.type}`}
            cx={point.x}
            cy={point.y}
            fill={point.type === "actual" ? "#ffd88e" : "#9dffe0"}
            r="5"
            stroke="rgba(19,34,56,0.85)"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="line-chart__legend">
        <span><i className="legend-dot legend-dot--actual" />Aktual</span>
        <span><i className="legend-dot legend-dot--forecast" />Forecast</span>
      </div>

      <div className="line-chart__labels">
        {points.map((point) => (
          <span key={`${point.label}-${point.type}`}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardSection() {
  const [today, setToday] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [forecast, setForecast] = useState({
    history: [],
    future: []
  });
  const [meta, setMeta] = useState({
    historyCount: 0,
    forecastCount: 0,
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [todayPayload, weeklyPayload, forecastPayload] = await Promise.all([
          getTodaySales(),
          getWeeklySales(),
          getForecast()
        ]);

        setToday(todayPayload.hourlySales || []);
        setWeekly(
          (weeklyPayload.dailySales || []).map((entry) => ({
            label: formatShortDate(entry.day),
            totalSales: entry.totalSales
          }))
        );
        setForecast({
          history: forecastPayload.history || [],
          future: forecastPayload.forecast || []
        });
        setMeta({
          historyCount: forecastPayload.basedOnRecords || 0,
          forecastCount: (forecastPayload.forecast || []).length,
          revenueToday: (todayPayload.hourlySales || []).reduce(
            (total, item) => total + Number(item.totalSales || 0),
            0
          )
        });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="section-stack">
      <div className="metrics-grid">
        <MetricTile
          label="Omzet Hari Ini"
          value={formatCurrency(meta.revenueToday)}
          helper="Diambil dari transaksi hari berjalan"
        />
        <MetricTile
          label="Data Histori"
          value={meta.historyCount}
          helper="Jumlah transaksi untuk model forecast"
        />
        <MetricTile
          label="Prediksi Berikutnya"
          value={meta.forecastCount}
          helper="Langkah forecast yang disiapkan backend"
        />
      </div>

      <div className="dashboard-grid">
        <GlassCard eyebrow="Live snapshot" title="Penjualan Hari Ini">
          {loading ? (
            <p className="muted">Memuat chart harian...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <BarChart
              items={today.map((item) => ({
                hour: `${String(item.hour).padStart(2, "0")}.00`,
                totalSales: item.totalSales
              }))}
              labelKey="hour"
              valueKey="totalSales"
            />
          )}
        </GlassCard>

        <GlassCard eyebrow="7 day flow" title="Penjualan Mingguan">
          {loading ? (
            <p className="muted">Memuat chart mingguan...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <BarChart items={weekly} labelKey="label" valueKey="totalSales" />
          )}
        </GlassCard>
      </div>

      <GlassCard eyebrow="Regression model" title="Forecast Penjualan">
        {loading ? (
          <p className="muted">Menghitung prediksi...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <div className="section-stack">
            <LineChart actual={forecast.history} forecast={forecast.future} />
            <div className="forecast-list">
              {forecast.future.map((entry) => (
                <div className="forecast-pill" key={entry.date}>
                  <span>{formatShortDate(entry.date)}</span>
                  <strong>{formatCurrency(entry.predictedValue)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

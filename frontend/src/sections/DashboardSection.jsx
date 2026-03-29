import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import MetricTile from "../components/MetricTile";
import {
  getForecast,
  getTodaySales,
  getWeeklySales
} from "../services/dashboardApi";
import { formatCurrency, formatDate, formatShortDate } from "../lib/format";

const TODAY_TIMEFRAMES = [
  { id: "6h", label: "6 Jam", hours: 6 },
  { id: "12h", label: "12 Jam", hours: 12 },
  { id: "24h", label: "24 Jam", hours: 24 }
];

const WEEK_TIMEFRAMES = [
  { id: "3d", label: "3 Hari", days: 3 },
  { id: "5d", label: "5 Hari", days: 5 },
  { id: "7d", label: "7 Hari", days: 7 }
];

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
            <span className="bar-chart__label">{item[labelKey]}</span>
            <div
              className="bar-chart__track"
              title={`${item.tooltipLabel || item[labelKey]} - ${formatCurrency(value)}`}
            >
              <div className="bar-chart__fill" style={{ width: `${width}%` }} />
            </div>
            <strong className="bar-chart__value">{formatCurrency(value)}</strong>
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
      tooltipLabel: formatDate(`${entry.date}T00:00:00+07:00`),
      value: Number(entry.totalSales || 0),
      type: "actual"
    })),
    ...forecast.map((entry) => ({
      label: formatShortDate(entry.date),
      tooltipLabel: formatDate(`${entry.date}T00:00:00+07:00`),
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
          <g key={`${point.label}-${point.type}`}>
            <title>{`${point.tooltipLabel} - ${formatCurrency(point.value)}`}</title>
            <circle
              cx={point.x}
              cy={point.y}
              fill={point.type === "actual" ? "#ffd88e" : "#9dffe0"}
              r="5"
              stroke="rgba(19,34,56,0.85)"
              strokeWidth="2"
            />
          </g>
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
    forecastRevenue: 0,
    forecastDate: "",
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todayTimeframe, setTodayTimeframe] = useState("24h");
  const [weekTimeframe, setWeekTimeframe] = useState("7d");
  const [concealed, setConcealed] = useState({
    revenueToday: false,
    forecastRevenue: false
  });

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
          forecastRevenue: Number(
            forecastPayload.forecast?.[0]?.predictedValue || 0
          ),
          forecastDate: forecastPayload.forecast?.[0]?.date || "",
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

  const selectedTodayTimeframe =
    TODAY_TIMEFRAMES.find((item) => item.id === todayTimeframe) || TODAY_TIMEFRAMES[2];
  const selectedWeekTimeframe =
    WEEK_TIMEFRAMES.find((item) => item.id === weekTimeframe) || WEEK_TIMEFRAMES[2];

  const normalizedToday = Array.from({ length: 24 }, (_, hour) => {
    const record = today.find((entry) => Number(entry.hour) === hour);
    return {
      hour,
      totalSales: Number(record?.totalSales || 0)
    };
  });

  const visibleToday = normalizedToday.slice(24 - selectedTodayTimeframe.hours).map((item) => ({
    hour: `${String(item.hour).padStart(2, "0")}.00`,
    totalSales: item.totalSales,
    tooltipLabel: `Jam ${String(item.hour).padStart(2, "0")}.00 GMT+7`
  }));

  const visibleWeekly = weekly.slice(Math.max(weekly.length - selectedWeekTimeframe.days, 0));
  const todayTimeframeTotal = visibleToday.reduce(
    (total, item) => total + Number(item.totalSales || 0),
    0
  );
  const weeklyTimeframeTotal = visibleWeekly.reduce(
    (total, item) => total + Number(item.totalSales || 0),
    0
  );

  return (
    <div className="section-stack">
      <div className="metrics-grid">
        <MetricTile
          label="Omzet Hari Ini"
          value={formatCurrency(meta.revenueToday)}
          helper="Diambil dari transaksi hari berjalan"
          concealed={concealed.revenueToday}
          onToggleConceal={() =>
            setConcealed((current) => ({
              ...current,
              revenueToday: !current.revenueToday
            }))
          }
        />
        <MetricTile
          label="Data Histori"
          value={meta.historyCount}
          helper="Hari penjualan yang dipakai model forecast"
        />
        <MetricTile
          label="Forecast Omzet"
          value={formatCurrency(meta.forecastRevenue)}
          helper={
            meta.forecastDate
              ? `Prediksi omset untuk ${formatShortDate(meta.forecastDate)}`
              : "Prediksi omset hari berikutnya"
          }
          concealed={concealed.forecastRevenue}
          onToggleConceal={() =>
            setConcealed((current) => ({
              ...current,
              forecastRevenue: !current.forecastRevenue
            }))
          }
        />
      </div>

      <div className="dashboard-grid">
        <GlassCard
          eyebrow="Live snapshot"
          title="Penjualan Hari Ini"
          action={
            <div className="card-action-stack">
              <strong className="card-total">{formatCurrency(todayTimeframeTotal)}</strong>
              <div className="timeframe-switcher" role="tablist" aria-label="Today timeframe">
                {TODAY_TIMEFRAMES.map((item) => (
                  <button
                    key={item.id}
                    className={
                      item.id === todayTimeframe
                        ? "timeframe-chip active"
                        : "timeframe-chip"
                    }
                    onClick={() => setTodayTimeframe(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          {loading ? (
            <p className="muted">Memuat chart harian...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <BarChart
              items={visibleToday}
              labelKey="hour"
              valueKey="totalSales"
            />
          )}
        </GlassCard>

        <GlassCard
          eyebrow="7 day flow"
          title="Penjualan Mingguan"
          action={
            <div className="card-action-stack">
              <strong className="card-total">{formatCurrency(weeklyTimeframeTotal)}</strong>
              <div className="timeframe-switcher" role="tablist" aria-label="Weekly timeframe">
                {WEEK_TIMEFRAMES.map((item) => (
                  <button
                    key={item.id}
                    className={
                      item.id === weekTimeframe
                        ? "timeframe-chip active"
                        : "timeframe-chip"
                    }
                    onClick={() => setWeekTimeframe(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          {loading ? (
            <p className="muted">Memuat chart mingguan...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <BarChart items={visibleWeekly} labelKey="label" valueKey="totalSales" />
          )}
        </GlassCard>
      </div>

      <GlassCard eyebrow="Regression model" title="Forecast">
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

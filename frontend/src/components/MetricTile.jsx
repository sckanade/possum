export default function MetricTile({
  label,
  value,
  helper,
  concealed = false,
  onToggleConceal = null
}) {
  return (
    <article className="metric-tile">
      <div className="metric-tile__header">
        <span>{label}</span>
        {onToggleConceal ? (
          <button
            aria-label={concealed ? `Show ${label}` : `Hide ${label}`}
            className="metric-tile__toggle"
            onClick={onToggleConceal}
            type="button"
          >
            {concealed ? "◌" : "◉"}
          </button>
        ) : null}
      </div>
      <strong>{concealed ? "••••••" : value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

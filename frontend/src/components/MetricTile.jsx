export default function MetricTile({ label, value, helper }) {
  return (
    <article className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

export default function GlassCard({
  title,
  eyebrow,
  children,
  action,
  className = ""
}) {
  return (
    <section className={`glass-card ${className}`.trim()}>
      <div className="glass-card__header">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {title ? <h2>{title}</h2> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

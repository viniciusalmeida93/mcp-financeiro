export default function EmptyState({ icon = '📭', text, subtext, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      {text && <p className="empty-state__text">{text}</p>}
      {subtext && <p className="empty-state__subtext">{subtext}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

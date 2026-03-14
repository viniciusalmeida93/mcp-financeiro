export default function EmptyState({ icon = '📭', text, subtext, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-4xl">{icon}</div>
      {text && (
        <p className="text-base font-medium text-foreground">{text}</p>
      )}
      {subtext && (
        <p className="text-sm text-muted-foreground">{subtext}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

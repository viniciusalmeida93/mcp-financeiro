import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, text, subtext, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
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

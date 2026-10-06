import { Plus } from 'lucide-react'

export default function FAB({ onClick, title = 'Adicionar', icon: Icon = Plus }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:right-6 md:bottom-6 z-40 size-14 cursor-pointer rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_0_1px_rgba(0,200,255,0.4),0_12px_32px_-8px_rgba(0,200,255,0.6)] hover:bg-[var(--va-blue-hover)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
    >
      <Icon size={24} strokeWidth={2.25} />
    </button>
  )
}

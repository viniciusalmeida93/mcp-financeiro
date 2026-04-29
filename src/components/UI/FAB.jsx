import { Plus } from 'lucide-react'

export default function FAB({ onClick, title = 'Adicionar', icon: Icon = Plus }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="fixed bottom-20 right-4 md:bottom-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
    >
      <Icon size={20} />
    </button>
  )
}

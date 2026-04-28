import { Plus } from 'lucide-react'

export default function FAB({ onClick, title = 'Adicionar', icon: Icon = Plus }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="fixed bottom-20 right-4 md:bottom-4 z-40 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
      style={{ backgroundColor: '#5ED0FF' }}
    >
      <Icon size={20} />
    </button>
  )
}

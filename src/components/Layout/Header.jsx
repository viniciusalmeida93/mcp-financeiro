import { useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const pageTitles = {
  '/': 'Dashboard',
  '/lancamentos': 'Lançamentos',
  '/categorias': 'Categorias',
  '/relatorios': 'Relatórios',
  '/cartoes': 'Cartões',
  '/clientes': 'Clientes',
  '/contas': 'Contas',
}

export default function Header() {
  const location = useLocation()
  const { signOut } = useAuth()
  const title = pageTitles[location.pathname] || 'VA Studio'

  return (
    <div className="shrink-0">
      <header className="h-14 bg-card flex items-center justify-between px-4">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <button
          onClick={signOut}
          className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </header>
      <Separator />
    </div>
  )
}

import { useLocation } from 'react-router-dom'
import { Separator } from '@/components/UI/separator'

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
  const title = pageTitles[location.pathname] || 'VA Studio'

  return (
    <div className="shrink-0">
      <header className="h-14 bg-card flex items-center justify-between px-4">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </header>
      <Separator />
    </div>
  )
}

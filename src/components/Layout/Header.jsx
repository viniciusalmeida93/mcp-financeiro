import { useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useMes } from '../../contexts/MesContext'
import { getMesesFrom, formatMesAno } from '../../utils/formatters'
import Select from '../UI/Select'

const pageTitles = {
  '/': 'Dashboard',
  '/lancamentos': 'Lançamentos',
  '/categorias': 'Categorias',
  '/relatorios': 'Relatórios',
  '/cartoes': 'Cartões',
  '/clientes': 'Receitas',
  '/contas': 'Despesas',
}

const meses = getMesesFrom('2026-01', '2026-12')

export default function Header() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { mes, setMes } = useMes()
  const title = pageTitles[location.pathname] || 'VA Studio'

  return (
    <div className="shrink-0">
      <header className="h-14 bg-card flex items-center justify-between px-4 gap-4">
        <h1 className="text-base font-semibold text-foreground shrink-0">{title}</h1>
        <Select
          options={[...meses].reverse().map(m => ({ value: m, label: formatMesAno(m) }))}
          value={mes}
          onChange={e => setMes(e.target.value)}
          className="w-40"
        />
        <button
          onClick={signOut}
          className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 transition-colors shrink-0"
        >
          <LogOut size={16} />
          Sair
        </button>
      </header>
      <Separator />
    </div>
  )
}

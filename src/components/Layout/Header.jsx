import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useMes } from '../../contexts/MesContext'
import { formatMesAno } from '../../utils/formatters'
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

// Janela dinâmica em torno do mês atual: 12 meses para trás + 6 meses para frente.
function buildMesesWindow(back = 12, forward = 6) {
  const meses = []
  const now = new Date()
  for (let i = forward; i >= -back; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    meses.push(`${y}-${m}`)
  }
  return meses
}

export default function Header() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { mes, setMes } = useMes()
  const title = pageTitles[location.pathname] || 'VA Studio'

  const meses = useMemo(() => buildMesesWindow(), [])

  return (
    <div className="shrink-0">
      <header className="h-14 bg-card flex items-center justify-between px-4 gap-4">
        <h1 className="text-base font-semibold text-foreground shrink-0">{title}</h1>
        <Select
          options={meses.map(m => ({ value: m, label: formatMesAno(m) }))}
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

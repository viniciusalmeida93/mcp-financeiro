import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useMes } from '../../contexts/MesContext'
import { formatMesAno } from '../../utils/formatters'
import Select from '../UI/Select'
import { navItems } from './navItems'

const pageTitles = Object.fromEntries(navItems.map(i => [i.to, i.label]))

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

const navBtn =
  'hidden sm:flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border bg-field text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40'

export default function Header() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { mes, setMes } = useMes()
  const title = pageTitles[location.pathname] || 'VA Studio'

  const meses = useMemo(() => buildMesesWindow(), [])
  // A lista vai do mais novo (índice 0) para o mais antigo.
  const idx = meses.indexOf(mes)

  return (
    <header className="ds-vidro shrink-0 sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground md:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={navBtn}
            onClick={() => setMes(meses[idx + 1])}
            disabled={idx < 0 || idx >= meses.length - 1}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <Select
            options={meses.map(m => ({ value: m, label: formatMesAno(m) }))}
            value={mes}
            onChange={e => setMes(e.target.value)}
            className="w-36 md:w-44"
          />
          <button
            type="button"
            className={navBtn}
            onClick={() => setMes(meses[idx - 1])}
            disabled={idx <= 0}
            aria-label="Próximo mês"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={signOut}
            aria-label="Sair"
            title="Sair"
            className="md:hidden ml-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}

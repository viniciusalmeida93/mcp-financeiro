import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useMes } from '../../contexts/MesContext'
import Select from '../UI/Select'
import { navItems } from './navItems'

const pageTitles = Object.fromEntries(navItems.map(i => [i.to, i.label]))

const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MES_OPTIONS = NOMES_MESES.map((label, i) => ({ value: String(i + 1).padStart(2, '0'), label }))

// Anos disponíveis: de 2026 (início do sistema) até 2 anos à frente do atual.
const ANO_INICIAL = 2026
function buildAnos(forward = 2) {
  const fim = Math.max(ANO_INICIAL, new Date().getFullYear() + forward)
  const anos = []
  for (let y = ANO_INICIAL; y <= fim; y++) anos.push(String(y))
  return anos
}

function somarMes(mes, delta) {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const navBtn =
  'hidden sm:flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border bg-field text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40'

export default function Header() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { mes, setMes } = useMes()
  const title = pageTitles[location.pathname] || 'VA Studio'

  const anos = useMemo(() => buildAnos(), [])
  const [anoSel, mesSel] = mes.split('-')
  const primeiroMes = `${anos[0]}-01`
  const ultimoMes = `${anos[anos.length - 1]}-12`

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
            onClick={() => setMes(somarMes(mes, -1))}
            disabled={mes <= primeiroMes}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <Select
            options={MES_OPTIONS}
            value={mesSel}
            onChange={e => setMes(`${anoSel}-${e.target.value}`)}
            className="w-32 md:w-36"
          />
          <Select
            options={anos.map(a => ({ value: a, label: a }))}
            value={anoSel}
            onChange={e => setMes(`${e.target.value}-${mesSel}`)}
            className="w-24"
          />
          <button
            type="button"
            className={navBtn}
            onClick={() => setMes(somarMes(mes, 1))}
            disabled={mes >= ultimoMes}
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

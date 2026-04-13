import { useState } from 'react'
import FluxoMensal from '../components/Relatorios/FluxoMensal'
import HistoricoCompleto from '../components/Relatorios/HistoricoCompleto'
import GastosPorCategoria from '../components/Relatorios/GastosPorCategoria'
import RelatorioNF from '../components/Relatorios/RelatorioNF'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'fluxo', label: 'Fluxo' },
  { value: 'categorias', label: 'Categorias' },
  { value: 'historico', label: 'Histórico' },
  { value: 'nf', label: 'NFs' },
]

export default function RelatoriosPage() {
  const [tab, setTab] = useState('fluxo')

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'h-10 rounded-md text-sm font-medium border transition-colors',
              tab === t.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:bg-accent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'fluxo' && <FluxoMensal />}
      {tab === 'categorias' && <GastosPorCategoria />}
      {tab === 'historico' && <HistoricoCompleto />}
      {tab === 'nf' && <RelatorioNF />}
    </div>
  )
}

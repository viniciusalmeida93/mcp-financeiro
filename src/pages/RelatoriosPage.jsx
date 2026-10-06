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
      <div role="tablist" className="grid grid-cols-4 gap-[3px] mb-4 rounded-md border bg-field p-[3px] md:w-fit md:min-w-[28rem]">
        {TABS.map(t => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'h-9 cursor-pointer rounded-sm px-3 text-sm font-medium transition-colors',
              tab === t.value
                ? 'bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(0,200,255,0.3)]'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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

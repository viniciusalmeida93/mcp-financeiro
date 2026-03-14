import { useState } from 'react'
import FluxoMensal from '../components/Relatorios/FluxoMensal'
import HistoricoCompleto from '../components/Relatorios/HistoricoCompleto'
import GastosPorCategoria from '../components/Relatorios/GastosPorCategoria'
import RelatorioNF from '../components/Relatorios/RelatorioNF'

const TABS = [
  { key: 'fluxo', label: '📈 Fluxo' },
  { key: 'historico', label: '🗓️ Histórico' },
  { key: 'categorias', label: '🏷️ Categorias' },
  { key: 'nf', label: '📋 NFs' },
]

export default function RelatoriosPage() {
  const [tab, setTab] = useState('fluxo')

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 'var(--spacing-md)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`filter-chip${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'fluxo' && <FluxoMensal />}
      {tab === 'historico' && <HistoricoCompleto />}
      {tab === 'categorias' && <GastosPorCategoria />}
      {tab === 'nf' && <RelatorioNF />}
    </>
  )
}

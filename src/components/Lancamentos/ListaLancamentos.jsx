import { useState } from 'react'
import LancamentoItem from './LancamentoItem'
import ContextToggle from '../UI/ContextToggle'
import Select from '../UI/Select'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import { getLastNMeses, formatMesAno, formatCurrency } from '../../utils/formatters'
import { getCategoriasByContexto } from '../../constants/categorias'
import { deleteLancamento, deleteGrupoParcelas } from '../../services/database'

const TIPOS_FILTER = [
  { value: 'todos', label: 'Todos' },
  { value: 'entrada', label: 'Entradas' },
  { value: 'saida', label: 'Saídas' },
]

export default function ListaLancamentos({ lancamentos, loading, filters, updateFilter, refresh }) {
  const meses = getLastNMeses(13)
  const categorias = [
    { value: '', label: 'Todas categorias' },
    ...getCategoriasByContexto(filters.contexto),
  ]
  const tiposOpts = TIPOS_FILTER

  const handleDelete = async (lancamento) => {
    if (!confirm(`Excluir "${lancamento.descricao}"?`)) return
    try {
      if (lancamento.grupo_parcela_id) {
        if (confirm('Excluir todas as parcelas desta compra?')) {
          await deleteGrupoParcelas(lancamento.grupo_parcela_id)
        } else {
          await deleteLancamento(lancamento.id)
        }
      } else {
        await deleteLancamento(lancamento.id)
      }
      refresh()
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    }
  }

  const totalEntradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
  const totalSaidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)

  return (
    <div>
      {/* Month selector */}
      <div className="month-selector" style={{ marginBottom: 'var(--spacing-sm)' }}>
        <select
          value={filters.mes}
          onChange={e => updateFilter('mes', e.target.value)}
          style={{ flex: 1 }}
        >
          {meses.map(m => (
            <option key={m} value={m}>{formatMesAno(m)}</option>
          ))}
        </select>
      </div>

      {/* Context toggle */}
      <ContextToggle value={filters.contexto} onChange={v => updateFilter('contexto', v)} />
      <div style={{ height: 'var(--spacing-sm)' }} />

      {/* Type + category filters */}
      <div className="filter-bar" style={{ marginBottom: 'var(--spacing-sm)' }}>
        {tiposOpts.map(t => (
          <button
            key={t.value}
            className={`filter-chip${filters.tipo === t.value ? ' active' : ''}`}
            onClick={() => updateFilter('tipo', t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-input-wrapper" style={{ marginBottom: 'var(--spacing-md)' }}>
        <span className="search-icon">🔍</span>
        <input
          placeholder="Buscar lançamento..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />
      </div>

      {/* Summary */}
      {!loading && lancamentos.length > 0 && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            ↑ {formatCurrency(totalEntradas)}
          </span>
          <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            ↓ {formatCurrency(totalSaidas)}
          </span>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            = {formatCurrency(totalEntradas - totalSaidas)}
          </span>
        </div>
      )}

      {loading ? (
        <LoadingScreen />
      ) : lancamentos.length === 0 ? (
        <EmptyState icon="📝" text="Nenhum lançamento encontrado" subtext="Tente ajustar os filtros ou adicione um novo lançamento" />
      ) : (
        <div className="card" style={{ padding: '0 var(--spacing-md)' }}>
          {lancamentos.map(l => (
            <LancamentoItem key={l.id} lancamento={l} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

import ListaDespesasFixas from '../components/Contas/ListaDespesasFixas'
import NovaDespesaFixa from '../components/Contas/NovaDespesaFixa'
import { useDespesasFixas } from '../hooks/useDespesasFixas'
import { useState } from 'react'
import { formatCurrency } from '../utils/formatters'

export default function ContasPage() {
  const [showForm, setShowForm] = useState(false)
  const { despesas, allDespesas, loading, error, contextoFilter, setContextoFilter, refresh } = useDespesasFixas()

  const gastoMensalEmpresa = allDespesas
    .filter(d => d.contexto === 'empresa')
    .reduce((s, d) => s + Number(d.valor), 0)

  const gastoMensalPessoal = allDespesas
    .filter(d => d.contexto === 'pessoal')
    .reduce((s, d) => s + Number(d.valor), 0)

  const gastoMensalTotal = gastoMensalEmpresa + gastoMensalPessoal

  return (
    <>
      {/* Metric cards */}
      <div className="metricas-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="metrica-card">
          <div className="metrica-card__label">💸 Gasto Mensal</div>
          <div className="metrica-card__value amount--negative">
            {loading ? '...' : formatCurrency(gastoMensalTotal)}
          </div>
        </div>
        <div className="metrica-card">
          <div className="metrica-card__label">💼 Empresa</div>
          <div className="metrica-card__value amount--negative">
            {loading ? '...' : formatCurrency(gastoMensalEmpresa)}
          </div>
        </div>
        <div className="metrica-card">
          <div className="metrica-card__label">🏠 Pessoal</div>
          <div className="metrica-card__value amount--negative">
            {loading ? '...' : formatCurrency(gastoMensalPessoal)}
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--color-danger)', marginBottom: 16 }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>Erro: {error}</p>
        </div>
      )}

      <ListaDespesasFixas
        despesas={despesas}
        allDespesas={allDespesas}
        loading={loading}
        contextoFilter={contextoFilter}
        setContextoFilter={setContextoFilter}
        refresh={refresh}
      />

      <button className="fab" onClick={() => setShowForm(true)} title="Nova despesa">+</button>

      <NovaDespesaFixa
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}

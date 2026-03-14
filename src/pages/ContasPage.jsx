import ListaDespesasFixas from '../components/Contas/ListaDespesasFixas'
import NovaDespesaFixa from '../components/Contas/NovaDespesaFixa'
import { useDespesasFixas } from '../hooks/useDespesasFixas'
import { useState } from 'react'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/UI/Button'

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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">💸 Gasto Mensal</div>
          <div className="text-lg font-semibold text-destructive">
            {loading ? '...' : formatCurrency(gastoMensalTotal)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">💼 Empresa</div>
          <div className="text-lg font-semibold text-destructive">
            {loading ? '...' : formatCurrency(gastoMensalEmpresa)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">🏠 Pessoal</div>
          <div className="text-lg font-semibold text-destructive">
            {loading ? '...' : formatCurrency(gastoMensalPessoal)}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive p-3 mb-4">
          <p className="text-destructive text-sm">Erro: {error}</p>
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

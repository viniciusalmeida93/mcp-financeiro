import { useState } from 'react'
import ListaDespesasFixas from '../components/Contas/ListaDespesasFixas'
import NovaDespesaFixa from '../components/Contas/NovaDespesaFixa'
import { useDespesasComStatus } from '../hooks/useDespesasFixas'
import { formatCurrency } from '../utils/formatters'
import { TrendingDown, CheckCircle, Clock } from 'lucide-react'

export default function ContasPage() {
  const [showForm, setShowForm] = useState(false)
  const {
    despesas,
    allDespesas,
    pagosNomes,
    loading,
    error,
    contextoFilter,
    setContextoFilter,
    refresh,
    handleTogglePago,
    calcTotais,
  } = useDespesasComStatus()

  const { total: despesasTotal, pago: despesasPagas, futuro: despesasFuturas } = calcTotais(contextoFilter)

  return (
    <>
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingDown size={12} />
            Despesas Totais
          </div>
          <div className="text-lg font-semibold text-destructive">
            {loading ? '...' : formatCurrency(despesasTotal)}
          </div>
          <div className="text-xs text-muted-foreground">esperadas este mês</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <CheckCircle size={12} />
            Pagas
          </div>
          <div className="text-lg font-semibold text-destructive">
            {loading ? '...' : formatCurrency(despesasPagas)}
          </div>
          <div className="text-xs text-muted-foreground">confirmadas este mês</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock size={12} />
            A Pagar
          </div>
          <div className={`text-lg font-semibold ${despesasFuturas > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {loading ? '...' : formatCurrency(despesasFuturas)}
          </div>
          <div className="text-xs text-muted-foreground">pendentes este mês</div>
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
        pagosNomes={pagosNomes}
        onTogglePago={handleTogglePago}
      />

      <button
        className="fixed bottom-20 right-4 md:bottom-4 z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl flex items-center justify-center shadow-lg hover:bg-primary/90"
        onClick={() => setShowForm(true)}
        title="Nova despesa"
      >+</button>

      <NovaDespesaFixa
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}

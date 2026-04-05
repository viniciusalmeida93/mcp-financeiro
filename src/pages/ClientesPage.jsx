import { useState } from 'react'
import ListaClientes from '../components/Clientes/ListaClientes'
import NovoCliente from '../components/Clientes/NovoCliente'
import { useClientesComStatus } from '../hooks/useClientes'
import { formatCurrency } from '../utils/formatters'
import { TrendingUp, CheckCircle, Clock, Plus } from 'lucide-react'

export default function ClientesPage() {
  const [contexto, setContexto] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const { clientes, pagosIds, loading, error, refresh, handleTogglePago, calcTotais } = useClientesComStatus()

  let filtered = contexto === 'todos'
    ? clientes
    : clientes.filter(c => (c.contexto || 'empresa') === contexto)
  if (tipoFilter !== 'todos') {
    filtered = filtered.filter(c => c.tipo === tipoFilter)
  }

  const { total: receitaTotal, recebido: receitaRecebida, futuro: receitaFutura } = calcTotais(contexto, tipoFilter)

  return (
    <>
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingUp size={12} />
            Total
          </div>
          <div className="text-lg font-semibold text-green-600">
            {loading ? '...' : formatCurrency(receitaTotal)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <CheckCircle size={12} />
            Recebido
          </div>
          <div className="text-lg font-semibold text-green-600">
            {loading ? '...' : formatCurrency(receitaRecebida)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock size={12} />
            Pendente
          </div>
          <div className={`text-lg font-semibold ${receitaFutura > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {loading ? '...' : formatCurrency(receitaFutura)}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive p-3 mb-4">
          <p className="text-destructive text-sm">Erro: {error}</p>
        </div>
      )}

      <ListaClientes
        clientes={filtered}
        loading={loading}
        refresh={refresh}
        pagosIds={pagosIds}
        onTogglePago={handleTogglePago}
        contexto={contexto}
        setContexto={setContexto}
        tipoFilter={tipoFilter}
        setTipoFilter={setTipoFilter}
      />

      <button
        className="fixed bottom-20 right-4 md:bottom-4 z-10 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90"
        style={{ backgroundColor: '#5ED0FF' }}
        onClick={() => setShowForm(true)}
        title="Novo cliente"
      >
        <Plus size={20} />
      </button>
      <NovoCliente
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}

import { useMemo, useState } from 'react'
import ListaClientes from '../components/Clientes/ListaClientes'
import NovoCliente from '../components/Clientes/NovoCliente'
import { useClientesComStatus } from '../hooks/useClientes'
import { formatCurrency } from '../utils/formatters'
import { TrendingUp, CheckCircle, Clock } from 'lucide-react'
import FAB from '../components/UI/FAB'

export default function ClientesPage() {
  const [contexto, setContexto] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { clientes, pagosIds, loading, error, refresh, handleTogglePago } = useClientesComStatus()

  // Lista final visível: aplica contexto + tipo + busca, ignorando inativos.
  // Os cards no topo refletem exatamente o que a lista mostra.
  const filteredClientes = useMemo(() => {
    let list = clientes.filter(c => c.status === 'ativo')
    if (contexto !== 'todos') {
      list = list.filter(c => (c.contexto || 'empresa') === contexto)
    }
    if (tipoFilter !== 'todos') {
      list = list.filter(c => c.tipo === tipoFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c => c.nome.toLowerCase().includes(q))
    }
    return list
  }, [clientes, contexto, tipoFilter, search])

  const { total, recebido, pendente } = useMemo(() => {
    const t = filteredClientes.reduce((s, c) => s + Number(c.valor), 0)
    const r = filteredClientes
      .filter(c => pagosIds.has(c.id))
      .reduce((s, c) => s + Number(c.valor), 0)
    return { total: t, recebido: r, pendente: t - r }
  }, [filteredClientes, pagosIds])

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
            {loading ? '...' : formatCurrency(total)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <CheckCircle size={12} />
            Recebido
          </div>
          <div className="text-lg font-semibold text-green-600">
            {loading ? '...' : formatCurrency(recebido)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock size={12} />
            Pendente
          </div>
          <div className={`text-lg font-semibold ${pendente > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {loading ? '...' : formatCurrency(pendente)}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive p-3 mb-4">
          <p className="text-destructive text-sm">Erro: {error}</p>
        </div>
      )}

      <ListaClientes
        clientes={filteredClientes}
        loading={loading}
        refresh={refresh}
        pagosIds={pagosIds}
        onTogglePago={handleTogglePago}
        contexto={contexto}
        setContexto={setContexto}
        tipoFilter={tipoFilter}
        setTipoFilter={setTipoFilter}
        search={search}
        setSearch={setSearch}
      />

      <FAB onClick={() => setShowForm(true)} title="Novo cliente" />
      <NovoCliente
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}

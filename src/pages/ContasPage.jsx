import { useMemo, useState } from 'react'
import ListaDespesasFixas from '../components/Contas/ListaDespesasFixas'
import NovaDespesaFixa from '../components/Contas/NovaDespesaFixa'
import { useDespesasComStatus } from '../hooks/useDespesasFixas'
import { formatCurrency } from '../utils/formatters'
import { TrendingDown, CheckCircle, Clock } from 'lucide-react'
import FAB from '../components/UI/FAB'

export default function ContasPage() {
  const [showForm, setShowForm] = useState(false)
  const [categoriaFilter, setCategoriaFilter] = useState('todos')
  const [cartaoFilter, setCartaoFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const {
    despesas,
    cartoes,
    pagosIds,
    loading,
    error,
    contextoFilter,
    setContextoFilter,
    refresh,
    handleTogglePago,
  } = useDespesasComStatus()

  // Lista final visível: aplica categoria + forma de pagamento + busca
  // sobre as despesas já filtradas por mês + contexto pelo hook.
  const filteredDespesas = useMemo(() => {
    let list = despesas
    if (categoriaFilter !== 'todos') {
      list = list.filter(d => d.categoria === categoriaFilter)
    }
    if (cartaoFilter !== 'todos') {
      list = list.filter(d => d.forma_pagamento === cartaoFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(d => d.nome.toLowerCase().includes(q))
    }
    return list
  }, [despesas, categoriaFilter, cartaoFilter, search])

  const { total, pago, pendente } = useMemo(() => {
    const t = filteredDespesas.reduce((s, d) => s + Number(d.valor), 0)
    const p = filteredDespesas
      .filter(d => pagosIds.has(d.id))
      .reduce((s, d) => s + Number(d.valor), 0)
    return { total: t, pago: p, pendente: t - p }
  }, [filteredDespesas, pagosIds])

  return (
    <>
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingDown size={12} />
            Total
          </div>
          <div className="text-lg font-semibold text-destructive">
            {loading ? '...' : formatCurrency(total)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <CheckCircle size={12} />
            Pago
          </div>
          <div className="text-lg font-semibold text-destructive">
            {loading ? '...' : formatCurrency(pago)}
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

      <ListaDespesasFixas
        despesas={filteredDespesas}
        cartoes={cartoes}
        loading={loading}
        contextoFilter={contextoFilter}
        setContextoFilter={setContextoFilter}
        categoriaFilter={categoriaFilter}
        setCategoriaFilter={setCategoriaFilter}
        cartaoFilter={cartaoFilter}
        setCartaoFilter={setCartaoFilter}
        search={search}
        setSearch={setSearch}
        refresh={refresh}
        pagosIds={pagosIds}
        onTogglePago={handleTogglePago}
      />

      <FAB onClick={() => setShowForm(true)} title="Nova despesa" />

      <NovaDespesaFixa
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}

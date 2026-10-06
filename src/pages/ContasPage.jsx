import { useMemo, useState } from 'react'
import ListaDespesasFixas from '../components/Contas/ListaDespesasFixas'
import NovaDespesaFixa from '../components/Contas/NovaDespesaFixa'
import { useDespesasComStatus } from '../hooks/useDespesasFixas'
import { formatCurrency } from '../utils/formatters'
import { TrendingDown, CheckCircle, Clock } from 'lucide-react'
import FAB from '../components/UI/FAB'
import StatCard from '../components/UI/StatCard'

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
      <div className="grid grid-cols-2 gap-2.5 mb-4 sm:grid-cols-3 sm:gap-3">
        <StatCard className="col-span-2 sm:col-span-1" label="Total" icon={TrendingDown} tone="destructive" loading={loading} value={formatCurrency(total)} />
        <StatCard label="Pago" icon={CheckCircle} tone="destructive" loading={loading} value={formatCurrency(pago)} />
        <StatCard label="Pendente" icon={Clock} tone={pendente > 0 ? 'warning' : 'neutral'} loading={loading} value={formatCurrency(pendente)} />
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

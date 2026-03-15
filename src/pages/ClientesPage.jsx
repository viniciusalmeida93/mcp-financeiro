import { useState } from 'react'
import ListaClientes from '../components/Clientes/ListaClientes'
import NovoCliente from '../components/Clientes/NovoCliente'
import { useClientes } from '../hooks/useClientes'
import { formatCurrency } from '../utils/formatters'
import { Tabs, TabsList, TabsTrigger } from '../components/UI/tabs'

export default function ClientesPage() {
  const [contexto, setContexto] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const { clientes, loading, error, refresh } = useClientes()

  const ativos = clientes.filter(c => c.status === 'ativo')
  const mensais = ativos.filter(c => c.tipo === 'mensal')
  const totalReceitas = mensais.reduce((s, c) => s + Number(c.valor), 0)
  const projecaoAnual = totalReceitas * 12
  const totalClientes = ativos.length

  const filtered = contexto === 'todos'
    ? clientes
    : clientes.filter(c => (c.contexto || 'empresa') === contexto)

  return (
    <>
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">💰 Receita Mensal</div>
          <div className="text-lg font-semibold text-green-600">
            {loading ? '...' : formatCurrency(totalReceitas)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">📈 Projeção Anual</div>
          <div className="text-lg font-semibold text-green-600">
            {loading ? '...' : formatCurrency(projecaoAnual)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">👥 Clientes Ativos</div>
          <div className="text-lg font-semibold">
            {loading ? '...' : totalClientes}
          </div>
        </div>
      </div>

      {/* Filtro contexto com Tabs */}
      <Tabs value={contexto} onValueChange={setContexto} className="mb-4">
        <TabsList>
          <TabsTrigger value="todos">Tudo</TabsTrigger>
          <TabsTrigger value="empresa">💼 Empresa</TabsTrigger>
          <TabsTrigger value="pessoal">🏠 Pessoal</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="rounded-lg border border-destructive p-3 mb-4">
          <p className="text-destructive text-sm">Erro: {error}</p>
        </div>
      )}

      <ListaClientes clientes={filtered} loading={loading} refresh={refresh} />

      <button
        className="fixed bottom-20 right-4 md:bottom-4 z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl flex items-center justify-center shadow-lg hover:bg-primary/90"
        onClick={() => setShowForm(true)}
        title="Novo cliente"
      >+</button>
      <NovoCliente
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </>
  )
}

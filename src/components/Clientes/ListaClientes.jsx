import { useState } from 'react'
import ClienteItem from './ClienteItem'
import NovoCliente from './NovoCliente'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import { Tabs, TabsList, TabsTrigger } from '../UI/tabs'
import { gerarNFParaCliente, createCliente } from '../../services/database'
import { enviarCobranca } from '../../services/email'
import { getCurrentMes } from '../../utils/formatters'

const TIPO_FILTER = [
  { value: 'todos', label: 'Todos' },
  { value: 'mensal', label: 'Recorrente' },
  { value: 'pontual', label: 'Pontual' },
]

export default function ListaClientes({ clientes, loading, refresh, pagosIds = new Set(), onTogglePago }) {
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [clienteEdit, setClienteEdit] = useState(null)

  const filtered = tipoFilter === 'todos'
    ? clientes
    : clientes.filter(c => c.tipo === tipoFilter)

  const handleCobrar = async (cliente) => {
    if (!cliente.email_cobranca) {
      alert('Este cliente não tem email de cobrança cadastrado.')
      return
    }
    if (!confirm(`Enviar cobrança para ${cliente.nome}?`)) return
    try {
      await enviarCobranca(cliente)
      alert('Email de cobrança enviado!')
    } catch (err) {
      alert('Erro ao enviar: ' + err.message)
    }
  }

  const handleGerarNF = async (cliente) => {
    try {
      await gerarNFParaCliente(cliente, getCurrentMes())
      alert(`NF gerada para ${cliente.nome}!`)
    } catch (err) {
      alert('Erro: ' + err.message)
    }
  }

  const handleEdit = (cliente) => {
    setClienteEdit(cliente)
    setShowForm(true)
  }

  const handleDuplicate = async (cliente) => {
    try {
      const { id, created_at, ...rest } = cliente
      await createCliente(rest)
      refresh()
    } catch (err) {
      alert('Erro ao duplicar: ' + err.message)
    }
  }

  return (
    <div>
      <Tabs value={tipoFilter} onValueChange={setTipoFilter} className="mb-4">
        <TabsList>
          {TIPO_FILTER.map(f => (
            <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" text="Nenhum cliente encontrado" />
      ) : (
        <div className="card" style={{ padding: '0 var(--spacing-md)' }}>
          {filtered.map(c => (
            <ClienteItem
              key={c.id}
              cliente={c}
              onTogglePago={onTogglePago}
              onGerarNF={handleGerarNF}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onCobrar={handleCobrar}
              isPago={pagosIds.has(c.id)}
            />
          ))}
        </div>
      )}

      <NovoCliente
        isOpen={showForm}
        onClose={() => { setShowForm(false); setClienteEdit(null) }}
        onSuccess={refresh}
        clienteEdit={clienteEdit}
      />
    </div>
  )
}

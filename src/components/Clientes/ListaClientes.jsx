import { useState } from 'react'
import ClienteItem from './ClienteItem'
import NovoCliente from './NovoCliente'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import { deleteCliente, createLancamento, gerarNFParaCliente } from '../../services/database'
import { getCurrentMes } from '../../utils/formatters'
import { toDateString } from '../../utils/dateHelpers'

const STATUS_FILTER = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
]

export default function ListaClientes({ clientes, loading, refresh }) {
  const [statusFilter, setStatusFilter] = useState('ativo')
  const [showForm, setShowForm] = useState(false)
  const [clienteEdit, setClienteEdit] = useState(null)

  const filtered = statusFilter === 'todos'
    ? clientes
    : clientes.filter(c => c.status === statusFilter)

  const handleMarcarPago = async (cliente) => {
    if (!confirm(`Registrar recebimento de ${cliente.nome}?`)) return
    try {
      await createLancamento({
        tipo: 'entrada',
        valor: cliente.valor,
        descricao: cliente.nome,
        categoria: 'cliente',
        forma_pagamento: 'pix',
        data: toDateString(new Date()),
        contexto: 'empresa',
        cliente_id: cliente.id,
      })
      alert('Recebimento registrado!')
      refresh()
    } catch (err) {
      alert('Erro: ' + err.message)
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

  return (
    <div>
      <div className="filter-bar" style={{ marginBottom: 'var(--spacing-md)' }}>
        {STATUS_FILTER.map(f => (
          <button
            key={f.value}
            className={`filter-chip${statusFilter === f.value ? ' active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

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
              onMarcarPago={handleMarcarPago}
              onGerarNF={handleGerarNF}
              onEdit={handleEdit}
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

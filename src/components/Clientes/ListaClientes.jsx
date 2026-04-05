import { useState } from 'react'
import ClienteItem from './ClienteItem'
import NovoCliente from './NovoCliente'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import SelectField from '../UI/Select'
import { gerarNFParaCliente, createCliente, deleteCliente } from '../../services/database'
import { enviarCobranca } from '../../services/email'
import { getCurrentMes } from '../../utils/formatters'

const CONTEXTO_OPTIONS = [
  { value: 'todos', label: 'Tudo' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'pessoal', label: 'Pessoal' },
]

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'mensal', label: 'Recorrente' },
  { value: 'pontual', label: 'Pontual' },
]

export default function ListaClientes({ clientes, loading, refresh, pagosIds = new Set(), onTogglePago, contexto, setContexto, tipoFilter, setTipoFilter }) {
  const [showForm, setShowForm] = useState(false)
  const [clienteEdit, setClienteEdit] = useState(null)

  const filtered = clientes

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

  const handleDelete = async (cliente) => {
    if (!confirm(`Excluir "${cliente.nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteCliente(cliente.id)
      refresh()
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
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
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SelectField
          options={CONTEXTO_OPTIONS}
          value={contexto}
          onValueChange={setContexto}
        />
        <SelectField
          options={TIPO_OPTIONS}
          value={tipoFilter}
          onValueChange={setTipoFilter}
        />
      </div>

      {loading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" text="Nenhum cliente encontrado" />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          {filtered.map(c => (
            <ClienteItem
              key={c.id}
              cliente={c}
              onTogglePago={onTogglePago}
              onGerarNF={handleGerarNF}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
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

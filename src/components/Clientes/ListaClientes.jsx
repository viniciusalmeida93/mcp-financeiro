import { useState, useEffect } from 'react'
import ClienteItem from './ClienteItem'
import NovoCliente from './NovoCliente'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import { Tabs, TabsList, TabsTrigger } from '../UI/tabs'
import { createLancamento, deleteLancamento, gerarNFParaCliente, createCliente } from '../../services/database'
import { enviarCobranca } from '../../services/email'
import { getCurrentMes } from '../../utils/formatters'
import { toDateString } from '../../utils/dateHelpers'
import { supabase } from '../../services/supabase'
import { getDaysInMonth } from 'date-fns'

function getLastDayOfMes(mes) {
  const [year, month] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(year, month - 1))).padStart(2, '0')}`
}

const TIPO_FILTER = [
  { value: 'todos', label: 'Todos' },
  { value: 'mensal', label: 'Recorrente' },
  { value: 'pontual', label: 'Pontual' },
]

export default function ListaClientes({ clientes, loading, refresh }) {
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [clienteEdit, setClienteEdit] = useState(null)
  const [pagosIds, setPagosIds] = useState(new Set())
  const [lancamentosMap, setLancamentosMap] = useState({}) // cliente_id → lancamento_id

  useEffect(() => {
    const mes = getCurrentMes()
    supabase
      .from('lancamentos')
      .select('id, cliente_id')
      .eq('tipo', 'entrada')
      .not('cliente_id', 'is', null)
      .gte('data', `${mes}-01`)
      .lte('data', getLastDayOfMes(mes))
      .then(({ data }) => {
        if (data) {
          setPagosIds(new Set(data.map(l => l.cliente_id)))
          const map = {}
          data.forEach(l => { map[l.cliente_id] = l.id })
          setLancamentosMap(map)
        }
      })
  }, [clientes])

  const filtered = tipoFilter === 'todos'
    ? clientes
    : clientes.filter(c => c.tipo === tipoFilter)

  const handleTogglePago = async (cliente) => {
    const isPago = pagosIds.has(cliente.id)
    try {
      if (isPago) {
        const lancId = lancamentosMap[cliente.id]
        if (lancId) await deleteLancamento(lancId)
      } else {
        await createLancamento({
          tipo: 'entrada',
          valor: cliente.valor,
          descricao: cliente.nome,
          categoria: 'cliente',
          forma_pagamento: 'pix',
          data: toDateString(new Date()),
          contexto: cliente.contexto || 'empresa',
          cliente_id: cliente.id,
        })
      }
      refresh()
    } catch (err) {
      alert('Erro: ' + err.message)
    }
  }

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
      {/* Tipo filter with Tabs */}
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
              onTogglePago={handleTogglePago}
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

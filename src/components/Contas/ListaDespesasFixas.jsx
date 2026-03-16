import { useState } from 'react'
import ContaItem from './ContaItem'
import NovaDespesaFixa from './NovaDespesaFixa'
import ContextToggle from '../UI/ContextToggle'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import { deleteDespesaFixa, createDespesaFixa } from '../../services/database'

export default function ListaDespesasFixas({
  despesas,
  allDespesas,
  loading,
  contextoFilter,
  setContextoFilter,
  refresh,
  pagosNomes = new Set(),
  onTogglePago,
}) {
  const [showForm, setShowForm] = useState(false)
  const [despesaEdit, setDespesaEdit] = useState(null)

  const handleDelete = async (conta) => {
    if (!confirm(`Excluir "${conta.nome}"?`)) return
    try {
      await deleteDespesaFixa(conta.id)
      refresh()
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    }
  }

  const handleEdit = (conta) => {
    setDespesaEdit(conta)
    setShowForm(true)
  }

  const handleDuplicate = async (conta) => {
    try {
      const { id, created_at, ...rest } = conta
      await createDespesaFixa(rest)
      refresh()
    } catch (err) {
      alert('Erro ao duplicar: ' + err.message)
    }
  }

  return (
    <div>
      <ContextToggle value={contextoFilter} onChange={setContextoFilter} />
      <div className="h-4" />

      {loading ? (
        <LoadingScreen />
      ) : despesas.length === 0 ? (
        <EmptyState icon="💳" text="Nenhuma despesa fixa encontrada" />
      ) : (
        <div className="card" style={{ padding: '0 var(--spacing-md)' }}>
          {despesas.map(d => (
            <ContaItem
              key={d.id}
              conta={d}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onTogglePago={onTogglePago}
              isPago={pagosNomes.has(d.nome)}
            />
          ))}
        </div>
      )}

      <NovaDespesaFixa
        isOpen={showForm}
        onClose={() => { setShowForm(false); setDespesaEdit(null) }}
        onSuccess={refresh}
        despesaEdit={despesaEdit}
      />
    </div>
  )
}

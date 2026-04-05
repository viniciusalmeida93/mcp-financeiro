import { useState, useEffect } from 'react'
import ContaItem from './ContaItem'
import NovaDespesaFixa from './NovaDespesaFixa'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import SelectField from '../UI/Select'
import { deleteDespesaFixa, createDespesaFixa, getCategoriasCustomizadas } from '../../services/database'

const CONTEXTO_OPTIONS = [
  { value: 'todos', label: 'Tudo' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'pessoal', label: 'Pessoal' },
]

export default function ListaDespesasFixas({
  despesas,
  allDespesas,
  cartoes = [],
  loading,
  contextoFilter,
  setContextoFilter,
  categoriaFilter,
  setCategoriaFilter,
  refresh,
  pagosIds = new Set(),
  onTogglePago,
}) {
  const [showForm, setShowForm] = useState(false)
  const [despesaEdit, setDespesaEdit] = useState(null)
  const [categoriasOptions, setCategoriasOptions] = useState([{ value: 'todos', label: 'Todas categorias' }])

  useEffect(() => {
    getCategoriasCustomizadas().then(data => {
      const despCats = data.filter(c => c.tipo === 'despesa')
      setCategoriasOptions([
        { value: 'todos', label: 'Todas categorias' },
        ...despCats.map(c => ({ value: c.nome, label: c.nome })),
      ])
    }).catch(() => {})
  }, [])

  const filtered = categoriaFilter === 'todos'
    ? despesas
    : despesas.filter(d => d.categoria === categoriaFilter)

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
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SelectField
          options={CONTEXTO_OPTIONS}
          value={contextoFilter}
          onValueChange={setContextoFilter}
        />
        <SelectField
          options={categoriasOptions}
          value={categoriaFilter}
          onValueChange={setCategoriaFilter}
        />
      </div>

      {loading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState icon="💳" text="Nenhuma despesa fixa encontrada" />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          {filtered.map(d => (
            <ContaItem
              key={d.id}
              conta={d}
              cartoes={cartoes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onTogglePago={onTogglePago}
              isPago={pagosIds.has(d.id)}
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

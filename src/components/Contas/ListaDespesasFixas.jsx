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
  const [search, setSearch] = useState('')
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

  let filtered = categoriaFilter === 'todos'
    ? despesas
    : despesas.filter(d => d.categoria === categoriaFilter)
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    filtered = filtered.filter(d => d.nome.toLowerCase().includes(q))
  }

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
      <input
        type="text"
        placeholder="Buscar despesa..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
      />
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

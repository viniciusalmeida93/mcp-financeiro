import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Pencil, Trash2 } from 'lucide-react'
import NovaCategoria from '../components/Categorias/NovaCategoria'
import Button from '../components/UI/Button'
import FAB from '../components/UI/FAB'
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card'
import { cn } from '@/lib/utils'
import { formatCurrency, formatMesAno } from '../utils/formatters'
import { useMes } from '../contexts/MesContext'
import { getCategoriaLabel } from '../constants/categorias'
import { getCategoriaIcon } from '@/lib/categoriaIcons'
import { getDespesasFixas, getClientes, getCartoes, createCategoriaCustomizada, updateCategoriaCustomizada, deleteCategoriaCustomizada, getCategoriasCustomizadas } from '../services/database'
import { despesaAparecemNoMes } from '../utils/cicloFatura'

export default function CategoriasPage() {
  const { mes } = useMes()
  const [filtro, setFiltro] = useState('todas') // todas | despesas | receitas
  const [loading, setLoading] = useState(true)
  const [despesasCats, setDespesasCats] = useState([])
  const [receitasCats, setReceitasCats] = useState([])
  const [totais, setTotais] = useState({ receitas: 0, despesas: 0 })
  const [showForm, setShowForm] = useState(false)
  const [categoriaEdit, setCategoriaEdit] = useState(null)
  const [categoriasCustom, setCategoriasCustom] = useState([])

  const fetchCategorias = useCallback(async () => {
    setLoading(true)
    try {
      const [despesas, clientes, cartoes] = await Promise.all([
        getDespesasFixas({ status: 'ativo' }),
        getClientes({ status: 'ativo' }),
        getCartoes(),
      ])

      // Despesas: filtrar por ciclo do mês
      const despDoMes = despesas.filter(d => despesaAparecemNoMes(d, mes, cartoes))
      // Receitas: só clientes mensais ativos
      const clientesDoMes = clientes.filter(c => c.tipo === 'mensal')

      const totalDespesas = despDoMes.reduce((s, d) => s + Number(d.valor), 0)
      const totalReceitas = clientesDoMes.reduce((s, c) => s + Number(c.valor), 0)

      const groupBy = (items, total, keyFn) => {
        const map = {}
        items.forEach(item => {
          const key = keyFn(item) || 'outros'
          map[key] = (map[key] || 0) + Number(item.valor)
        })
        return Object.entries(map)
          .map(([categoria, valor]) => ({
            categoria,
            label: getCategoriaLabel(categoria),
            valor,
            percentual: total > 0 ? (valor / total) * 100 : 0,
          }))
          .sort((a, b) => b.valor - a.valor)
      }

      setDespesasCats(groupBy(despDoMes, totalDespesas, d => d.categoria))
      setReceitasCats(groupBy(clientesDoMes, totalReceitas, c => c.servico))
      setTotais({ receitas: totalReceitas, despesas: totalDespesas })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { fetchCategorias() }, [fetchCategorias])

  const fetchCustom = useCallback(async () => {
    try {
      const data = await getCategoriasCustomizadas()
      setCategoriasCustom(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => { fetchCustom() }, [fetchCustom])

  const handleSaveCategoria = async (catData) => {
    if (categoriaEdit) {
      await updateCategoriaCustomizada(categoriaEdit.id, catData)
    } else {
      await createCategoriaCustomizada(catData)
    }
    fetchCustom()
  }

  const handleDeleteCategoria = async (cat) => {
    if (!confirm(`Excluir categoria "${cat.nome}"?`)) return
    try {
      await deleteCategoriaCustomizada(cat.id)
      fetchCustom()
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    }
  }

  const handleEditCategoria = (cat) => {
    setCategoriaEdit(cat)
    setShowForm(true)
  }

  const renderSection = (titulo, categorias, total, tipo) => {
    if (categorias.length === 0) return null
    const progressColor = tipo === 'despesas' ? 'bg-primary' : 'bg-green-500'
    const valueColor = tipo === 'despesas' ? 'text-destructive' : 'text-green-600'

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-bold">{titulo}</CardTitle>
          <span className={`text-base font-semibold ${valueColor}`}>{formatCurrency(total)}</span>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="flex flex-col">
            {categorias.map((cat, i) => (
              <div
                key={cat.categoria}
                className={`py-3 ${i < categorias.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tipo === 'despesas' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600'}`}>
                      {(() => { const Icon = getCategoriaIcon(cat.categoria); return <Icon className="h-4 w-4" /> })()}
                    </div>
                    <span className="font-medium text-sm">{cat.label}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-sm">{formatCurrency(cat.valor)}</div>
                    <div className="text-xs text-muted-foreground">{cat.percentual.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${progressColor}`}
                    style={{ width: `${Math.min(cat.percentual, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { value: 'todas', label: 'Todas' },
          { value: 'despesas', label: 'Despesas' },
          { value: 'receitas', label: 'Receitas' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFiltro(opt.value)}
            className={cn(
              'h-10 rounded-md text-sm font-medium border transition-colors',
              filtro === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:bg-accent'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <>
          {(filtro === 'todas' || filtro === 'despesas') &&
            renderSection('Despesas', despesasCats, totais.despesas, 'despesas')}
          {(filtro === 'todas' || filtro === 'receitas') &&
            renderSection('Receitas', receitasCats, totais.receitas, 'receitas')}

          {despesasCats.length === 0 && receitasCats.length === 0 && (
            <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
              <BarChart3 className="h-10 w-10" strokeWidth={1.5} />
              <div className="text-sm">Nenhum lançamento em {formatMesAno(mes)}</div>
            </div>
          )}
        </>
      )}

      {/* Categorias cadastradas */}
      {categoriasCustom.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base font-bold">Categorias Cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {categoriasCustom.map((cat, i) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between py-2 ${i < categoriasCustom.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: cat.cor || '#808080' }} />
                  <span className="font-medium text-sm">{cat.nome}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {cat.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategoria(cat)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCategoria(cat)} title="Excluir" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <FAB onClick={() => setShowForm(true)} title="Nova categoria" />

      {showForm && (
        <NovaCategoria
          onSave={handleSaveCategoria}
          onClose={() => { setShowForm(false); setCategoriaEdit(null) }}
          categoriaEdit={categoriaEdit}
        />
      )}
    </>
  )
}

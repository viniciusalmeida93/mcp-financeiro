import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import Header from '../components/Layout/Header'
import NovaCategoria from '../components/Categorias/NovaCategoria'
import { formatCurrency, formatMesAno, getCurrentMes, getLastNMeses } from '../utils/formatters'
import { getCategoriaLabel } from '../constants/categorias'
import { createCategoriaCustomizada, updateCategoriaCustomizada, deleteCategoriaCustomizada, getCategoriasCustomizadas } from '../services/database'
import { getDaysInMonth } from 'date-fns'

function getLastDayOfMes(mes) {
  const [year, month] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(year, month - 1))).padStart(2, '0')}`
}

const CATEGORIA_ICONS = {
  cliente: '👤',
  projetos: '🎯',
  assinaturas: '🔄',
  time: '👥',
  educacao: '📚',
  infraestrutura: '🖥️',
  outros_empresa: '📦',
  receita_servico: '💼',
  alimentacao: '🍽️',
  supermercado: '🛒',
  combustivel: '⛽',
  transporte: '🚗',
  saude: '🏥',
  lazer: '🎮',
  moradia: '🏠',
  familia: '👨‍👩‍👧',
  divida: '💳',
  outros: '📋',
}

export default function CategoriasPage() {
  const [mes, setMes] = useState(getCurrentMes())
  const [filtro, setFiltro] = useState('todas') // todas | despesas | receitas
  const [loading, setLoading] = useState(true)
  const [despesasCats, setDespesasCats] = useState([])
  const [receitasCats, setReceitasCats] = useState([])
  const [totais, setTotais] = useState({ receitas: 0, despesas: 0 })
  const [showForm, setShowForm] = useState(false)
  const [categoriaEdit, setCategoriaEdit] = useState(null)
  const [categoriasCustom, setCategoriasCustom] = useState([])

  const meses = getLastNMeses(12)

  const fetchCategorias = useCallback(async () => {
    setLoading(true)
    try {
      const { data: lancamentos, error } = await supabase
        .from('lancamentos')
        .select('*')
        .gte('data', `${mes}-01`)
        .lte('data', getLastDayOfMes(mes))

      if (error) throw error

      const saidas = lancamentos.filter(l => l.tipo === 'saida')
      const entradas = lancamentos.filter(l => l.tipo === 'entrada')

      const totalDespesas = saidas.reduce((s, l) => s + Number(l.valor), 0)
      const totalReceitas = entradas.reduce((s, l) => s + Number(l.valor), 0)

      const groupBy = (items, total) => {
        const map = {}
        items.forEach(l => {
          const key = l.categoria || 'outros'
          map[key] = (map[key] || 0) + Number(l.valor)
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

      setDespesasCats(groupBy(saidas, totalDespesas))
      setReceitasCats(groupBy(entradas, totalReceitas))
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

  const FILTROS = [
    { key: 'todas', label: 'Todas' },
    { key: 'despesas', label: 'Despesas' },
    { key: 'receitas', label: 'Receitas' },
  ]

  const renderSection = (titulo, categorias, total, tipo) => {
    if (categorias.length === 0) return null
    const corBarra = tipo === 'despesas' ? 'empresa' : 'success'
    const corValor = tipo === 'despesas' ? 'amount--negative' : 'amount--positive'

    return (
      <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="card__header">
          <span className="card__title" style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text)' }}>
            {titulo}
          </span>
          <span className={`card__value ${corValor}`} style={{ fontSize: 'var(--font-size-md)' }}>
            {formatCurrency(total)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {categorias.map((cat, i) => (
            <div key={cat.categoria} style={{
              padding: 'var(--spacing-md) 0',
              borderBottom: i < categorias.length - 1 ? '1px solid var(--color-border-light)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: tipo === 'despesas' ? 'rgba(31,80,122,0.1)' : 'rgba(112,173,71,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    {CATEGORIA_ICONS[cat.categoria] || '📋'}
                  </div>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
                    {cat.label}
                  </span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
                    {formatCurrency(cat.valor)}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {cat.percentual.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <div
                  className={`progress-bar__fill progress-bar__fill--${corBarra}`}
                  style={{ width: `${Math.min(cat.percentual, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Header title="Categorias" />

      {/* Month selector + filters */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
        <select value={mes} onChange={e => setMes(e.target.value)}
          style={{ height: 36, width: 'auto', fontSize: 'var(--font-size-sm)', paddingRight: 'var(--spacing-lg)' }}>
          {meses.map(m => (
            <option key={m} value={m}>{formatMesAno(m)}</option>
          ))}
        </select>

        <div className="filter-bar" style={{ overflow: 'visible', paddingBottom: 0 }}>
          {FILTROS.map(f => (
            <button key={f.key}
              className={`filter-chip ${filtro === f.key ? 'active' : ''}`}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          {(filtro === 'todas' || filtro === 'despesas') &&
            renderSection('Despesas', despesasCats, totais.despesas, 'despesas')}
          {(filtro === 'todas' || filtro === 'receitas') &&
            renderSection('Receitas', receitasCats, totais.receitas, 'receitas')}

          {despesasCats.length === 0 && receitasCats.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📊</div>
              <div className="empty-state__text">Nenhum lançamento em {formatMesAno(mes)}</div>
            </div>
          )}
        </>
      )}

      {/* Categorias cadastradas */}
      {categoriasCustom.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className="card__header">
            <span className="card__title" style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>
              Categorias Cadastradas
            </span>
          </div>
          {categoriasCustom.map((cat, i) => (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--spacing-sm) 0',
              borderBottom: i < categoriasCustom.length - 1 ? '1px solid var(--color-border-light)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: cat.cor || '#808080', flexShrink: 0 }} />
                <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{cat.nome}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                  {cat.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => handleEditCategoria(cat)} title="Editar">✏️</button>
                <button className="btn btn--ghost btn--sm" onClick={() => handleDeleteCategoria(cat)} title="Excluir" style={{ color: 'var(--color-danger)' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowForm(true)} title="Nova categoria">+</button>

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

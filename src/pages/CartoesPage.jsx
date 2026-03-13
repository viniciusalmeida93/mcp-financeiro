import { useState, useEffect, useCallback } from 'react'
import Header from '../components/Layout/Header'
import CartaoItem from '../components/Cartoes/CartaoItem'
import NovoCartao from '../components/Cartoes/NovoCartao'
import EmptyState from '../components/UI/EmptyState'
import { getCartoes, createCartao, updateCartao, deleteCartao } from '../services/database'
import { formatCurrency } from '../utils/formatters'

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCartao, setEditingCartao] = useState(null)
  const [contexto, setContexto] = useState('todos')
  const [cartaoFilter, setCartaoFilter] = useState('todos')

  const fetchCartoes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCartoes({})
      setCartoes(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCartoes() }, [fetchCartoes])

  const handleSave = async (cartaoData) => {
    if (editingCartao) {
      await updateCartao(editingCartao.id, cartaoData)
    } else {
      await createCartao(cartaoData)
    }
    fetchCartoes()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir cartão?')) return
    await deleteCartao(id)
    fetchCartoes()
  }

  const handleEdit = (cartao) => {
    setEditingCartao(cartao)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCartao(null)
  }

  const handleDuplicate = async (cartao) => {
    try {
      const { id, created_at, ...rest } = cartao
      await createCartao(rest)
      fetchCartoes()
    } catch (err) {
      alert('Erro ao duplicar: ' + err.message)
    }
  }

  const filtered = cartoes.filter(c => {
    const matchContexto = contexto === 'todos' ||
      c.contexto === contexto ||
      c.contexto === 'ambos'
    const matchCartao = cartaoFilter === 'todos' || c.id === cartaoFilter
    return matchContexto && matchCartao
  })

  const totalLimite = filtered.reduce((s, c) => s + Number(c.limite), 0)
  const totalFatura = filtered.reduce((s, c) => s + Number(c.fatura_atual), 0)
  const utilizacaoGeral = totalLimite > 0 ? Math.round((totalFatura / totalLimite) * 100) : 0

  return (
    <>
      <Header title="Cartões" />

      {/* Resumo geral */}
      {cartoes.length > 0 && (
        <div className="saldo-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className="saldo-mini-card saldo-mini-card--total">
            <div className="saldo-mini-card__label">💳 Limite Total</div>
            <div className="saldo-mini-card__value">{formatCurrency(totalLimite)}</div>
          </div>
          <div className="saldo-mini-card saldo-mini-card--empresa">
            <div className="saldo-mini-card__label">📄 Fatura Total</div>
            <div className={`saldo-mini-card__value ${utilizacaoGeral >= 80 ? 'amount--negative' : ''}`}>
              {formatCurrency(totalFatura)}
            </div>
          </div>
          <div className="saldo-mini-card" style={{ borderTop: '3px solid var(--color-text-muted)' }}>
            <div className="saldo-mini-card__label">📊 Utilização</div>
            <div className={`saldo-mini-card__value ${utilizacaoGeral >= 80 ? 'amount--negative' : utilizacaoGeral >= 60 ? '' : 'amount--positive'}`}>
              {utilizacaoGeral}%
            </div>
          </div>
        </div>
      )}

      {/* Filtro contexto */}
      <div className="context-toggle" style={{ marginBottom: 'var(--spacing-sm)' }}>
        {[
          { value: 'todos', label: 'Todos' },
          { value: 'empresa', label: '💼 Empresa' },
          { value: 'pessoal', label: '🏠 Pessoal' },
          { value: 'ambos', label: '🔄 Ambos' },
        ].map(c => (
          <button key={c.value}
            className={`context-toggle__btn ${contexto === c.value ? `active--${c.value}` : ''}`}
            onClick={() => { setContexto(c.value); setCartaoFilter('todos') }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Filtro por cartão individual */}
      {cartoes.length > 0 && (
        <div className="filter-bar" style={{ marginBottom: 'var(--spacing-md)' }}>
          <button
            className={`filter-chip${cartaoFilter === 'todos' ? ' active' : ''}`}
            onClick={() => setCartaoFilter('todos')}
          >
            Todos
          </button>
          {cartoes.map(c => (
            <button
              key={c.id}
              className={`filter-chip${cartaoFilter === c.id ? ' active' : ''}`}
              onClick={() => setCartaoFilter(c.id)}
            >
              {c.nome} ****{c.numero_final}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💳"
          text="Nenhum cartão encontrado"
          subtext="Adicione seus cartões de crédito e débito para acompanhar a fatura"
        />
      ) : (
        <div>
          {filtered.map(c => (
            <CartaoItem key={c.id} cartao={c} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
          ))}
        </div>
      )}

      {/* FAB mobile */}
      <button className="fab" onClick={() => setShowForm(true)} title="Novo cartão">+</button>

      {showForm && (
        <NovoCartao
          cartao={editingCartao}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </>
  )
}

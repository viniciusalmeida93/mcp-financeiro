import { useState, useEffect, useCallback } from 'react'
import CartaoItem from '../components/Cartoes/CartaoItem'
import NovoCartao from '../components/Cartoes/NovoCartao'
import EmptyState from '../components/UI/EmptyState'
import Button from '../components/UI/Button'
import { Tabs, TabsList, TabsTrigger } from '../components/UI/tabs'
import { getCartoes, createCartao, updateCartao, deleteCartao, getDespesasFixas } from '../services/database'
import { formatCurrency } from '../utils/formatters'

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState([])
  const [despesasFixas, setDespesasFixas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCartao, setEditingCartao] = useState(null)
  const [contexto, setContexto] = useState('ambos')
  const [cartaoFilter, setCartaoFilter] = useState('todos')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [cartData, despData] = await Promise.all([
        getCartoes({}),
        getDespesasFixas({ status: 'ativo' }),
      ])
      setCartoes(cartData)
      setDespesasFixas(despData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (cartaoData) => {
    if (editingCartao) {
      await updateCartao(editingCartao.id, cartaoData)
    } else {
      await createCartao(cartaoData)
    }
    fetchAll()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir cartão?')) return
    await deleteCartao(id)
    fetchAll()
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
      fetchAll()
    } catch (err) {
      alert('Erro ao duplicar: ' + err.message)
    }
  }

  const filtered = cartoes.filter(c => {
    const matchContexto = contexto === 'ambos' ||
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
      {/* Resumo geral */}
      {cartoes.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground mb-1">💳 Limite Total</div>
            <div className="text-lg font-semibold">{formatCurrency(totalLimite)}</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground mb-1">📄 Fatura Total</div>
            <div className={`text-lg font-semibold ${utilizacaoGeral >= 80 ? 'text-destructive' : ''}`}>
              {formatCurrency(totalFatura)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground mb-1">📊 Utilização</div>
            <div className={`text-lg font-semibold ${utilizacaoGeral >= 80 ? 'text-destructive' : utilizacaoGeral >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>
              {utilizacaoGeral}%
            </div>
          </div>
        </div>
      )}

      {/* Filtro contexto com Tabs */}
      <Tabs value={contexto} onValueChange={(v) => { setContexto(v); setCartaoFilter('todos') }} className="mb-3">
        <TabsList>
          <TabsTrigger value="ambos">🔄 Ambos</TabsTrigger>
          <TabsTrigger value="empresa">💼 Empresa</TabsTrigger>
          <TabsTrigger value="pessoal">🏠 Pessoal</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filtro por cartão individual */}
      {cartoes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1">
          <Button
            variant={cartaoFilter === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCartaoFilter('todos')}
          >
            Todos
          </Button>
          {cartoes.map(c => (
            <Button
              key={c.id}
              variant={cartaoFilter === c.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCartaoFilter(c.id)}
            >
              {c.nome} ****{c.numero_final}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💳"
          text="Nenhum cartão encontrado"
          subtext="Adicione seus cartões de crédito e débito para acompanhar a fatura"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CartaoItem
              key={c.id}
              cartao={c}
              despesas={despesasFixas.filter(d => d.forma_pagamento === `cartao:${c.id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* FAB mobile */}
      <button
        className="fixed bottom-20 right-4 md:bottom-4 z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl flex items-center justify-center shadow-lg hover:bg-primary/90"
        onClick={() => setShowForm(true)}
        title="Novo cartão"
      >+</button>

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

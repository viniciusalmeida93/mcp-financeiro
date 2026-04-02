import { useState, useEffect, useCallback } from 'react'
import CartaoItem from '../components/Cartoes/CartaoItem'
import NovoCartao from '../components/Cartoes/NovoCartao'
import EmptyState from '../components/UI/EmptyState'
import SelectField from '../components/UI/Select'
import { Plus } from 'lucide-react'
import { getCartoes, createCartao, updateCartao, deleteCartao, getDespesasFixas } from '../services/database'
import { formatCurrency } from '../utils/formatters'
import { useMes } from '../contexts/MesContext'
import { calcParcelaNoMes } from '../utils/cicloFatura'

const CONTEXTO_OPTIONS = [
  { value: 'ambos', label: 'Todos' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'pessoal', label: 'Pessoal' },
]

/**
 * Filtra despesas que pertencem a um cartão no mês selecionado,
 * respeitando o ciclo de fechamento.
 */
function getDespesasDoCartaoNoMes(despesas, cartao, mesSelecionado, cartoes) {
  const cartaoId = cartao.id
  const linked = despesas.filter(d => d.forma_pagamento === `cartao:${cartaoId}`)

  return linked.filter(d => {
    // Parcelas: só se a parcela cabe no mês
    if (d.recorrencia === 'parcela') {
      return calcParcelaNoMes(d, mesSelecionado, cartoes) !== null
    }
    // Pontual: só no mês de referência ou created_at
    if (d.recorrencia === 'pontual') {
      if (d.mes_referencia) return d.mes_referencia === mesSelecionado
      if (d.created_at) {
        const created = new Date(d.created_at)
        const createdDay = created.getDate()
        let createdMonth = created.getMonth() + 1
        let createdYear = created.getFullYear()
        // Se dia > fechamento, cai no mês seguinte
        if (cartao.dia_fechamento && createdDay > cartao.dia_fechamento) {
          createdMonth += 1
          if (createdMonth > 12) { createdMonth = 1; createdYear += 1 }
        }
        const mesEfetivo = `${createdYear}-${String(createdMonth).padStart(2, '0')}`
        return mesEfetivo === mesSelecionado
      }
      return false
    }
    // Mensal: aparece todo mês
    return true
  })
}

export default function CartoesPage() {
  const { mes } = useMes()
  const [cartoes, setCartoes] = useState([])
  const [despesasFixas, setDespesasFixas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCartao, setEditingCartao] = useState(null)
  const [contexto, setContexto] = useState('ambos')

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
    return contexto === 'ambos' ||
      c.contexto === contexto ||
      c.contexto === 'ambos'
  })

  // Calcular fatura de cada cartão baseado nas despesas do mês
  const faturasPorCartao = {}
  filtered.forEach(c => {
    const despDoMes = getDespesasDoCartaoNoMes(despesasFixas, c, mes, cartoes)
    faturasPorCartao[c.id] = despDoMes.reduce((s, d) => s + Number(d.valor), 0)
  })

  const totalLimite = filtered.reduce((s, c) => s + Number(c.limite), 0)
  const totalFatura = filtered.reduce((s, c) => s + (faturasPorCartao[c.id] || 0), 0)
  const utilizacaoGeral = totalLimite > 0 ? Math.round((totalFatura / totalLimite) * 100) : 0

  return (
    <>
      {/* Resumo geral */}
      {cartoes.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground mb-1">Limite</div>
            <div className="text-lg font-semibold">{formatCurrency(totalLimite)}</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground mb-1">Fatura</div>
            <div className={`text-lg font-semibold ${utilizacaoGeral >= 80 ? 'text-destructive' : ''}`}>
              {formatCurrency(totalFatura)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground mb-1">Utilização</div>
            <div className={`text-lg font-semibold ${utilizacaoGeral >= 80 ? 'text-destructive' : utilizacaoGeral >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>
              {utilizacaoGeral}%
            </div>
          </div>
        </div>
      )}

      {/* Filtro contexto */}
      <div className="mb-4">
        <SelectField
          options={CONTEXTO_OPTIONS}
          value={contexto}
          onValueChange={setContexto}
          className="w-40"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💳"
          text="Nenhum cartão encontrado"
          subtext="Adicione seus cartões de crédito para acompanhar a fatura"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(c => {
            const despDoMes = getDespesasDoCartaoNoMes(despesasFixas, c, mes, cartoes)
            return (
              <CartaoItem
                key={c.id}
                cartao={c}
                despesas={despDoMes}
                faturaCalculada={faturasPorCartao[c.id] || 0}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            )
          })}
        </div>
      )}

      {/* FAB */}
      <button
        className="fixed bottom-20 right-4 md:bottom-4 z-10 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90"
        style={{ backgroundColor: '#5ED0FF' }}
        onClick={() => setShowForm(true)}
        title="Novo cartão"
      >
        <Plus size={20} />
      </button>

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

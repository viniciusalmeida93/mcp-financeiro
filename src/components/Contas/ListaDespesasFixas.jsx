import { useState, useEffect } from 'react'
import ContaItem from './ContaItem'
import NovaDespesaFixa from './NovaDespesaFixa'
import ContextToggle from '../UI/ContextToggle'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import Card from '../UI/Card'
import { formatCurrency, getCurrentMes } from '../../utils/formatters'
import { deleteDespesaFixa, deleteLancamento, createLancamento, createDespesaFixa } from '../../services/database'
import { supabase } from '../../services/supabase'
import { toDateString } from '../../utils/dateHelpers'
import { getDaysInMonth } from 'date-fns'

function getLastDayOfMes(mes) {
  const [year, month] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(year, month - 1))).padStart(2, '0')}`
}

export default function ListaDespesasFixas({ despesas, allDespesas, loading, contextoFilter, setContextoFilter, refresh }) {
  const [showForm, setShowForm] = useState(false)
  const [despesaEdit, setDespesaEdit] = useState(null)
  const [pagosNomes, setPagosNomes] = useState(new Set())
  const [lancamentosMap, setLancamentosMap] = useState({}) // nome → lancamento_id

  useEffect(() => {
    const mes = getCurrentMes()
    supabase
      .from('lancamentos')
      .select('id, descricao')
      .eq('tipo', 'saida')
      .gte('data', `${mes}-01`)
      .lte('data', getLastDayOfMes(mes))
      .then(({ data }) => {
        if (data) {
          setPagosNomes(new Set(data.map(l => l.descricao)))
          const map = {}
          data.forEach(l => { map[l.descricao] = l.id })
          setLancamentosMap(map)
        }
      })
  }, [despesas])

  const handleTogglePago = async (conta) => {
    const isPago = pagosNomes.has(conta.nome)
    try {
      if (isPago) {
        const lancId = lancamentosMap[conta.nome]
        if (lancId) await deleteLancamento(lancId)
      } else {
        await createLancamento({
          tipo: 'saida',
          valor: conta.valor,
          descricao: conta.nome,
          categoria: conta.categoria,
          forma_pagamento: conta.forma_pagamento,
          data: toDateString(new Date()),
          contexto: conta.contexto,
        })
      }
      refresh()
    } catch (err) {
      alert('Erro ao registrar pagamento: ' + err.message)
    }
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

  const empresa = allDespesas.filter(d => d.contexto === 'empresa')
  const pessoal = allDespesas.filter(d => d.contexto === 'pessoal')
  const totalEmpresa = empresa.reduce((s, d) => s + Number(d.valor), 0)
  const totalPessoal = pessoal.reduce((s, d) => s + Number(d.valor), 0)

  return (
    <div>
      {/* Summary */}
      {!loading && (
        <Card style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className="summary-row">
            <span className="summary-row__label">💼 Empresa</span>
            <span className="summary-row__value" style={{ color: 'var(--color-empresa-primary)' }}>
              {formatCurrency(totalEmpresa)}/mês
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">🏠 Pessoal</span>
            <span className="summary-row__value" style={{ color: 'var(--color-pessoal-primary)' }}>
              {formatCurrency(totalPessoal)}/mês
            </span>
          </div>
          <div className="summary-row summary-row--total">
            <span className="summary-row__label">Total Fixo</span>
            <span className="summary-row__value">{formatCurrency(totalEmpresa + totalPessoal)}/mês</span>
          </div>
        </Card>
      )}

      <ContextToggle value={contextoFilter} onChange={setContextoFilter} />
      <div style={{ height: 'var(--spacing-md)' }} />

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
              onTogglePago={handleTogglePago}
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

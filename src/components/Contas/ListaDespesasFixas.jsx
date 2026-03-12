import { useState } from 'react'
import ContaItem from './ContaItem'
import NovaDespesaFixa from './NovaDespesaFixa'
import ContextToggle from '../UI/ContextToggle'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'
import { deleteDespesaFixa } from '../../services/database'

export default function ListaDespesasFixas({ despesas, allDespesas, loading, contextoFilter, setContextoFilter, refresh }) {
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
            <ContaItem key={d.id} conta={d} onEdit={handleEdit} onDelete={handleDelete} />
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

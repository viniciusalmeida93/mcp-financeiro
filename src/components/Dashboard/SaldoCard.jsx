import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'

export default function SaldoCard({ saldoEmpresa, saldoPessoal, saldoTotal, loading }) {
  const now = new Date()
  const updated = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <Card>
      <div className="card__header">
        <span className="card__title">💰 Saldo Atual</span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className={`card__value ${saldoTotal >= 0 ? 'card__value--positive' : 'card__value--negative'}`}>
            {formatCurrency(saldoTotal)}
          </div>
          <div className="card__subtitle">Atualizado: {updated}</div>

          <div className="card__divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
            <span>
              <span style={{ color: 'var(--color-empresa-primary)' }}>💼 Empresa</span>
              <span style={{ marginLeft: 8, fontWeight: 600 }}>{formatCurrency(saldoEmpresa)}</span>
            </span>
            <span>
              <span style={{ color: 'var(--color-pessoal-primary)' }}>🏠 Pessoal</span>
              <span style={{ marginLeft: 8, fontWeight: 600, color: saldoPessoal < 0 ? 'var(--color-danger)' : undefined }}>
                {formatCurrency(saldoPessoal)}
              </span>
            </span>
          </div>
        </>
      )}
    </Card>
  )
}

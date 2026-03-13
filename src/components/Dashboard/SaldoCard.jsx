import { formatCurrency } from '../../utils/formatters'

export default function SaldoCard({ saldoEmpresa, saldoPessoal, saldoTotal, loading }) {
  if (loading) {
    return (
      <div className="saldo-grid">
        {[0, 1, 2].map(i => (
          <div key={i} className="saldo-mini-card"><div className="spinner" /></div>
        ))}
      </div>
    )
  }

  return (
    <div className="saldo-grid">
      <div className="saldo-mini-card saldo-mini-card--total">
        <div className="saldo-mini-card__label">💰 Total</div>
        <div className={`saldo-mini-card__value ${saldoTotal >= 0 ? 'amount--positive' : 'amount--negative'}`}>
          {formatCurrency(saldoTotal)}
        </div>
      </div>
      <div className="saldo-mini-card saldo-mini-card--empresa">
        <div className="saldo-mini-card__label">💼 Empresa</div>
        <div className={`saldo-mini-card__value ${saldoEmpresa < 0 ? 'amount--negative' : ''}`}>
          {formatCurrency(saldoEmpresa)}
        </div>
      </div>
      <div className="saldo-mini-card saldo-mini-card--pessoal">
        <div className="saldo-mini-card__label">🏠 Pessoal</div>
        <div className={`saldo-mini-card__value ${saldoPessoal < 0 ? 'amount--negative' : ''}`}>
          {formatCurrency(saldoPessoal)}
        </div>
      </div>
    </div>
  )
}

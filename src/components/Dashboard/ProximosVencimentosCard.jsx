import Card from '../UI/Card'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import { toDateString } from '../../utils/dateHelpers'
import EmptyState from '../UI/EmptyState'

export default function ProximosVencimentosCard({ proximasContas, loading, pagosNomes = new Set(), onPagar }) {
  const empresa = proximasContas.filter(c => c.contexto === 'empresa')
  const pessoal = proximasContas.filter(c => c.contexto === 'pessoal')
  const total = proximasContas.reduce((s, c) => s + Number(c.valor), 0)

  const hoje = toDateString(new Date())

  const renderConta = (conta, contexto) => {
    const venc = toDateString(conta.proximoVencimento)
    const atrasado = venc < hoje
    const pago = pagosNomes.has(conta.nome)

    return (
      <div key={conta.id} className={`dashboard-check-item list-item list-item--${contexto} ${pago ? 'dashboard-check-item--pago' : ''}`}>
        <button
          className={`dashboard-checkbox ${pago ? 'dashboard-checkbox--checked' : ''}`}
          onClick={() => !pago && onPagar && onPagar(conta)}
          title={pago ? 'Já pago' : 'Marcar como pago'}
        >
          {pago ? '✓' : ''}
        </button>
        <div className="list-item__body">
          <div className="list-item__title">{conta.nome}</div>
          <div className="list-item__subtitle">{formatDateShort(conta.proximoVencimento)}</div>
        </div>
        <div className={`list-item__value ${atrasado && !pago ? 'list-item__value--negative' : ''}`}>
          {formatCurrency(conta.valor)}
          {atrasado && !pago && ' ⚠️'}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <div className="card__header">
        <span className="card__title">📅 Próximas Contas (7 dias)</span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : proximasContas.length === 0 ? (
        <EmptyState icon="✅" text="Nenhuma conta nos próximos 7 dias" />
      ) : (
        <>
          {empresa.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-empresa-primary)', fontWeight: 600, marginBottom: 4 }}>
                💼 EMPRESA
              </div>
              {empresa.map(conta => renderConta(conta, 'empresa'))}
            </div>
          )}

          {pessoal.length > 0 && (
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-pessoal-primary)', fontWeight: 600, marginBottom: 4 }}>
                🏠 PESSOAL
              </div>
              {pessoal.map(conta => renderConta(conta, 'pessoal'))}
            </div>
          )}

          <div className="card__divider" />
          <div className="summary-row summary-row--total">
            <span className="summary-row__label">Total 7 dias</span>
            <span className="summary-row__value">{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </Card>
  )
}

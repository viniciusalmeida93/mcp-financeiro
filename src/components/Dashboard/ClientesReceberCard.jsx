import Card from '../UI/Card'
import Badge from '../UI/Badge'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import EmptyState from '../UI/EmptyState'

export default function ClientesReceberCard({ clientesAReceber, loading, pagosClienteIds = new Set(), onReceber }) {
  const total = clientesAReceber.reduce((s, c) => s + Number(c.valor), 0)

  return (
    <Card>
      <div className="card__header">
        <span className="card__title">💰 Clientes a Receber (7 dias)</span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : clientesAReceber.length === 0 ? (
        <EmptyState icon="💸" text="Nenhum recebimento nos próximos 7 dias" />
      ) : (
        <>
          {clientesAReceber.map(cliente => {
            const recebido = pagosClienteIds.has(cliente.id)
            return (
              <div key={cliente.id} className={`dashboard-check-item list-item list-item--empresa ${recebido ? 'dashboard-check-item--pago' : ''}`}>
                <button
                  className={`dashboard-checkbox ${recebido ? 'dashboard-checkbox--checked' : ''}`}
                  onClick={() => !recebido && onReceber && onReceber(cliente)}
                  title={recebido ? 'Já recebido' : 'Marcar como recebido'}
                >
                  {recebido ? '✓' : ''}
                </button>
                <div className="list-item__body">
                  <div className="list-item__title">{cliente.nome}</div>
                  <div className="list-item__subtitle">
                    {formatDateShort(cliente.proximoVencimento)}
                    {cliente.precisa_nf && (
                      <Badge variant="warning" style={{ marginLeft: 4 }}>📋 NF</Badge>
                    )}
                  </div>
                </div>
                <div className={`list-item__value ${recebido ? 'amount--positive' : 'list-item__value--positive'}`}>
                  {formatCurrency(cliente.valor)}
                </div>
              </div>
            )
          })}

          <div className="card__divider" />
          <div className="summary-row summary-row--total">
            <span className="summary-row__label">Total 7 dias</span>
            <span className="summary-row__value amount--positive">{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </Card>
  )
}

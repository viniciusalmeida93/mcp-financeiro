import Card from '../UI/Card'
import Badge from '../UI/Badge'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import EmptyState from '../UI/EmptyState'

export default function ClientesReceberCard({ clientesAReceber, loading }) {
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
          {clientesAReceber.map(cliente => (
            <div key={cliente.id} className="list-item list-item--empresa">
              <div className="list-item__body">
                <div className="list-item__title">{cliente.nome}</div>
                <div className="list-item__subtitle">
                  {formatDateShort(cliente.proximoVencimento)}
                  {cliente.precisa_nf && (
                    <Badge variant="warning" style={{ marginLeft: 4 }}>📋 NF</Badge>
                  )}
                </div>
              </div>
              <div className="list-item__value list-item__value--positive">
                {formatCurrency(cliente.valor)}
                {cliente.precisa_nf && ' 📋'}
              </div>
            </div>
          ))}

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

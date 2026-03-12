import { formatCurrency, formatDate } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'
import { getFormaPagamentoLabel } from '../../constants/formasPagamento'
import Badge from '../UI/Badge'

export default function LancamentoItem({ lancamento, onDelete }) {
  const isEntrada = lancamento.tipo === 'entrada'
  const contextClass = `list-item--${lancamento.contexto}`

  return (
    <div className={`list-item ${contextClass}`}>
      <div className="list-item__body">
        <div className="list-item__title">
          {lancamento.descricao}
          {lancamento.parcelado && (
            <Badge variant="neutral" style={{ marginLeft: 6 }}>
              {lancamento.parcela_atual}/{lancamento.parcela_total}
            </Badge>
          )}
        </div>
        <div className="list-item__subtitle">
          {formatDate(lancamento.data)} · {getCategoriaLabel(lancamento.categoria)} · {getFormaPagamentoLabel(lancamento.forma_pagamento)}
        </div>
      </div>

      <div className="list-item__value">
        <div className={isEntrada ? 'amount--positive' : 'amount--negative'}>
          {isEntrada ? '+' : '-'}{formatCurrency(lancamento.valor)}
        </div>
      </div>

      {onDelete && (
        <div className="list-item__actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => onDelete(lancamento)}
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

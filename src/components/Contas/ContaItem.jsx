import { formatCurrency } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'
import { getFormaPagamentoLabel } from '../../constants/formasPagamento'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

export default function ContaItem({ conta, onEdit, onDelete }) {
  const contextClass = `list-item--${conta.contexto}`

  return (
    <div className={`list-item ${contextClass}`}>
      <div className="list-item__body">
        <div className="list-item__title">
          {conta.nome}
          {conta.recorrencia === 'parcela' && conta.parcela_atual && (
            <Badge variant="neutral" style={{ marginLeft: 6 }}>
              {conta.parcela_atual}/{conta.parcela_total}
            </Badge>
          )}
        </div>
        <div className="list-item__subtitle">
          Dia {conta.dia_vencimento} · {getCategoriaLabel(conta.categoria)} · {getFormaPagamentoLabel(conta.forma_pagamento)}
        </div>
      </div>

      <div className="list-item__value">
        {formatCurrency(conta.valor)}
      </div>

      <div className="list-item__actions">
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(conta)} title="Editar">
            ✏️
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={() => onDelete(conta)} title="Excluir">
            🗑️
          </Button>
        )}
      </div>
    </div>
  )
}

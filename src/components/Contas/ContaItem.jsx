import { formatCurrency } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'
import { getFormaPagamentoLabel } from '../../constants/formasPagamento'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="9" height="10" rx="1.5"/>
    <path d="M5 5V3.5A1.5 1.5 0 016.5 2H13A1.5 1.5 0 0114.5 3.5V10A1.5 1.5 0 0113 11.5H11"/>
  </svg>
)

export default function ContaItem({ conta, onEdit, onDelete, onTogglePago, onDuplicate, isPago }) {
  const contextClass = `list-item--${conta.contexto}`

  return (
    <div className={`list-item ${contextClass} ${isPago ? 'list-item--pago' : ''}`}>
      <button
        className={`dashboard-checkbox ${isPago ? 'dashboard-checkbox--checked' : ''}`}
        onClick={() => onTogglePago && onTogglePago(conta)}
        title={isPago ? 'Clique para desmarcar' : 'Marcar como pago'}
        style={{ marginRight: 'var(--spacing-sm)' }}
      >
        {isPago ? '✓' : ''}
      </button>

      <div className="list-item__body">
        <div className="list-item__title">
          {conta.nome}
          {conta.recorrencia === 'parcela' && conta.parcela_atual && (
            <Badge variant="neutral" style={{ marginLeft: 6 }}>
              {conta.parcela_atual}/{conta.parcela_total}
            </Badge>
          )}
        </div>
        <div className="list-item__subtitle" style={{ color: isPago ? 'var(--color-success)' : undefined }}>
          {isPago ? '✓ Pago' : `Dia ${conta.dia_vencimento} · ${getCategoriaLabel(conta.categoria)} · ${getFormaPagamentoLabel(conta.forma_pagamento)}`}
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
        {onDuplicate && (
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(conta)} title="Duplicar">
            <CopyIcon />
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

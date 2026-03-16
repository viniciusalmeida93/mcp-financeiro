import { formatCurrency } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'
import { getFormaPagamentoLabel } from '../../constants/formasPagamento'
import Badge from '../UI/Badge'
import Button from '../UI/Button'
import { cn } from '@/lib/utils'

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="9" height="10" rx="1.5"/>
    <path d="M5 5V3.5A1.5 1.5 0 016.5 2H13A1.5 1.5 0 0114.5 3.5V10A1.5 1.5 0 0113 11.5H11"/>
  </svg>
)

export default function ContaItem({ conta, onEdit, onDelete, onTogglePago, onDuplicate, isPago }) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors',
      isPago && 'opacity-60'
    )}>
      <button
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-colors',
          isPago
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-muted-foreground hover:border-green-500'
        )}
        onClick={() => onTogglePago && onTogglePago(conta)}
        title={isPago ? 'Clique para desmarcar' : 'Marcar como pago'}
      >
        {isPago ? '✓' : ''}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-sm">
          {conta.nome}
          {conta.recorrencia === 'parcela' && conta.parcela_atual && (
            <Badge variant="secondary" className="text-xs">
              {conta.parcela_atual}/{conta.parcela_total}
            </Badge>
          )}
        </div>
        <div className={cn('text-xs text-muted-foreground mt-0.5', isPago && 'text-green-500')}>
          {(() => {
            const dateInfo = `Dia ${conta.dia_vencimento} · ${getCategoriaLabel(conta.categoria)} · ${getFormaPagamentoLabel(conta.forma_pagamento)}`
            return isPago ? `✓ Pago · ${dateInfo}` : dateInfo
          })()}
        </div>
      </div>

      <div className="font-semibold text-sm tabular-nums">
        {formatCurrency(conta.valor)}
      </div>

      <div className="flex items-center gap-1 shrink-0">
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

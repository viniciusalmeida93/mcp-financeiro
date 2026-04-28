import { formatCurrency } from '../../utils/formatters'
import Badge from '../UI/Badge'
import { Pencil, Copy, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMes } from '../../contexts/MesContext'
import { calcParcelaNoMes, formatDataVencimento } from '../../utils/cicloFatura'

function getFormaPagamentoSimple(value, cartoes = []) {
  if (value?.startsWith('cartao:')) {
    const id = value.replace('cartao:', '')
    const cartao = cartoes.find(c => c.id === id)
    return cartao ? cartao.nome : 'Cartão'
  }
  const labels = { pix: 'PIX', debito: 'Débito', boleto: 'Boleto', dinheiro: 'Dinheiro' }
  return labels[value] || value
}

export default function ContaItem({ conta, cartoes = [], onEdit, onDelete, onTogglePago, onDuplicate, isPago }) {
  const { mes } = useMes()
  const parcela = calcParcelaNoMes(conta, mes, cartoes)

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors',
      isPago && 'opacity-60'
    )}>
      <button
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          isPago
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-muted-foreground hover:border-green-500'
        )}
        onClick={() => onTogglePago && onTogglePago(conta)}
        title={isPago ? 'Clique para desmarcar' : 'Marcar como pago'}
      >
        {isPago && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-sm">
          {conta.nome}
          {parcela && (
            <Badge variant="secondary" className="text-xs">
              {parcela.atual}/{parcela.total}
            </Badge>
          )}
        </div>
        <div className={cn('text-xs text-muted-foreground mt-0.5', isPago && 'text-green-500')}>
          {isPago && 'Pago · '}
          {getFormaPagamentoSimple(conta.forma_pagamento, cartoes)}
          {' · '}
          {formatDataVencimento(conta.dia_vencimento, mes, conta, cartoes)}
        </div>
      </div>

      <div className="font-semibold text-sm tabular-nums shrink-0">
        {formatCurrency(conta.valor)}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {onEdit && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onEdit(conta)} title="Editar">
            <Pencil size={14} />
          </button>
        )}
        {onDuplicate && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onDuplicate(conta)} title="Duplicar">
            <Copy size={14} />
          </button>
        )}
        {onDelete && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors" onClick={() => onDelete(conta)} title="Excluir">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

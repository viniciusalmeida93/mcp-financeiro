import { formatCurrency } from '../../utils/formatters'
import Badge from '../UI/Badge'
import RowActions from '../UI/RowActions'
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
            ? 'bg-success border-success text-black'
            : 'border-muted-foreground hover:border-success'
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
        <div className={cn('text-xs text-muted-foreground mt-0.5', isPago && 'text-success')}>
          {isPago && 'Pago · '}
          {getFormaPagamentoSimple(conta.forma_pagamento, cartoes)}
          {' · '}
          {formatDataVencimento(conta.dia_vencimento, mes, conta, cartoes)}
        </div>
      </div>

      <div className="font-semibold text-sm tabular-nums shrink-0">
        {formatCurrency(conta.valor)}
      </div>

      <RowActions
        actions={[
          onEdit && { icon: Pencil, label: 'Editar', onClick: () => onEdit(conta) },
          onDuplicate && { icon: Copy, label: 'Duplicar', onClick: () => onDuplicate(conta) },
          onDelete && { icon: Trash2, label: 'Excluir', onClick: () => onDelete(conta), destructive: true },
        ]}
      />
    </div>
  )
}

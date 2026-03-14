import { formatCurrency, formatDate } from '../../utils/formatters'
import { getCategoriaLabel } from '../../constants/categorias'
import { getFormaPagamentoLabel } from '../../constants/formasPagamento'
import Badge from '../UI/Badge'
import { Button } from '@/components/UI/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LancamentoItem({ lancamento, onDelete }) {
  const isEntrada = lancamento.tipo === 'entrada'

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 border-b last:border-b-0',
      'hover:bg-accent/50 transition-colors'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-sm">
          {lancamento.descricao}
          {lancamento.parcelado && (
            <Badge variant="neutral" className="ml-1">
              {lancamento.parcela_atual}/{lancamento.parcela_total}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatDate(lancamento.data)} · {getCategoriaLabel(lancamento.categoria)} · {getFormaPagamentoLabel(lancamento.forma_pagamento)}
        </div>
      </div>

      <div className={cn(
        'font-semibold text-sm tabular-nums',
        isEntrada ? 'text-green-500' : 'text-red-500'
      )}>
        {isEntrada ? '+' : '-'}{formatCurrency(lancamento.valor)}
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onDelete(lancamento)}
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

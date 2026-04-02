import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'
import { Card, CardContent } from '../UI/Card'
import Badge from '../UI/Badge'
import { Pencil, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const BANDEIRA_ICONS = {
  visa: '💳',
  mastercard: '🟠',
  elo: '⚡',
  amex: '💎',
  hipercard: '🔴',
  outro: '💳',
}

export default function CartaoItem({ cartao, despesas = [], faturaCalculada = 0, onEdit, onDelete, onDuplicate }) {
  const [open, setOpen] = useState(false)

  const utilizacao = cartao.limite > 0
    ? Math.round((faturaCalculada / cartao.limite) * 100)
    : 0
  const utilizacaoColor = utilizacao >= 80
    ? 'text-destructive'
    : utilizacao >= 60
      ? 'text-yellow-600'
      : 'text-green-600'
  const progressColor = utilizacao >= 80
    ? 'bg-destructive'
    : utilizacao >= 60
      ? 'bg-yellow-500'
      : 'bg-green-500'
  const bandeira = cartao.bandeira?.toLowerCase() || 'outro'

  return (
    <Card className="overflow-hidden">
      {/* Cartão visual */}
      <div
        className="p-4 text-white relative"
        style={
          cartao.cor
            ? { background: `linear-gradient(135deg, ${cartao.cor} 0%, ${cartao.cor}cc 100%)` }
            : { background: 'linear-gradient(135deg, #1f507a 0%, #1f507acc 100%)' }
        }
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-2xl">{BANDEIRA_ICONS[bandeira] || '💳'}</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 capitalize">
            {cartao.contexto}
          </Badge>
        </div>
        <div className="text-lg font-mono tracking-widest mb-4 opacity-90">
          •••• •••• •••• {cartao.numero_final}
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-70">Titular</div>
            <div className="font-semibold text-sm">{cartao.nome}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70">Fecha dia</div>
            <div className="font-semibold text-sm">{cartao.dia_fechamento || '-'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70">Vence dia</div>
            <div className="font-semibold text-sm">{cartao.vencimento_fatura}</div>
          </div>
        </div>
      </div>

      <CardContent className="pt-4">
        {/* Fatura do mês */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Fatura do mês</div>
            <div className={`text-lg font-bold ${utilizacaoColor}`}>{formatCurrency(faturaCalculada)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Limite</div>
            <div className="font-semibold">{formatCurrency(cartao.limite)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Utilização</span>
            <span className={utilizacaoColor}>{utilizacao}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressColor}`}
              style={{ width: `${Math.min(utilizacao, 100)}%` }}
            />
          </div>
        </div>

        {/* Despesas vinculadas no mês */}
        {despesas.length > 0 && (
          <div className="border-t pt-3 mb-4">
            <button
              className="w-full flex items-center justify-between text-sm"
              onClick={() => setOpen(o => !o)}
            >
              <span className="text-muted-foreground">Detalhes ({despesas.length})</span>
              <span className="flex items-center gap-1">
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            {open && (
              <div className="mt-2 space-y-1">
                {despesas.map(d => (
                  <div key={d.id} className="flex justify-between text-xs text-muted-foreground py-0.5">
                    <span>{d.nome}</span>
                    <span>{formatCurrency(d.valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1">
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onEdit(cartao)} title="Editar">
            <Pencil size={14} />
          </button>
          {onDuplicate && (
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onDuplicate(cartao)} title="Duplicar">
              <Copy size={14} />
            </button>
          )}
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors ml-auto" onClick={() => onDelete(cartao.id)} title="Excluir">
            <Trash2 size={14} />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

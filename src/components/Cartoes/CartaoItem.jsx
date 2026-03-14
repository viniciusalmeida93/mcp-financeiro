import { formatCurrency } from '../../utils/formatters'
import { Card, CardContent } from '../UI/Card'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

const BANDEIRA_ICONS = {
  visa: '💳',
  mastercard: '🟠',
  elo: '⚡',
  amex: '💎',
  hipercard: '🔴',
  outro: '💳',
}

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="9" height="10" rx="1.5"/>
    <path d="M5 5V3.5A1.5 1.5 0 016.5 2H13A1.5 1.5 0 0114.5 3.5V10A1.5 1.5 0 0113 11.5H11"/>
  </svg>
)

export default function CartaoItem({ cartao, onEdit, onDelete, onDuplicate }) {
  const utilizacao = cartao.limite > 0
    ? Math.round((cartao.fatura_atual / cartao.limite) * 100)
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
        className={`p-4 text-white relative ${cartao.contexto === 'pessoal' ? '' : ''}`}
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
            <div className="text-xs opacity-70">Vence dia</div>
            <div className="font-semibold text-sm">{cartao.vencimento_fatura}</div>
          </div>
          <div className="text-right capitalize text-sm opacity-80">{cartao.bandeira}</div>
        </div>
      </div>

      <CardContent className="pt-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground">Limite</div>
            <div className="font-semibold">{formatCurrency(cartao.limite)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fatura Atual</div>
            <div className={`font-semibold ${utilizacaoColor}`}>
              {formatCurrency(cartao.fatura_atual)}
            </div>
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

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(cartao)}>
            ✏️ Editar
          </Button>
          {onDuplicate && (
            <Button variant="ghost" size="sm" onClick={() => onDuplicate(cartao)} title="Duplicar">
              <CopyIcon />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={() => onDelete(cartao.id)}
          >
            🗑️ Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

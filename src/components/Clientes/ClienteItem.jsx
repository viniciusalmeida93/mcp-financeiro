import { formatCurrency } from '../../utils/formatters'
import Badge from '../UI/Badge'
import Button from '../UI/Button'
import { cn } from '@/lib/utils'

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="9" height="10" rx="1.5"/>
    <path d="M5 5V3.5A1.5 1.5 0 016.5 2H13A1.5 1.5 0 0114.5 3.5V10A1.5 1.5 0 0113 11.5H11"/>
  </svg>
)

export default function ClienteItem({ cliente, onTogglePago, onCobrar, onGerarNF, onEdit, onDuplicate, onDelete, isPago }) {
  const isAtivo = cliente.status === 'ativo'
  const isPontual = cliente.tipo === 'pontual'

  const dateInfo = isPontual
    ? `Pontual · ${formatCurrency(cliente.valor)}`
    : `Dia ${cliente.dia_vencimento} · ${formatCurrency(cliente.valor)}/mês`

  const subtitle = isPago ? `✓ Recebido · ${dateInfo}` : dateInfo

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
        onClick={() => onTogglePago && onTogglePago(cliente)}
        title={isPago ? 'Clique para desmarcar' : 'Marcar como recebido'}
      >
        {isPago ? '✓' : ''}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap font-medium text-sm">
          {cliente.nome}
          <Badge variant={isPontual ? 'secondary' : 'default'} className="text-xs">
            {isPontual ? 'Pontual' : 'Recorrente'}
          </Badge>
          {cliente.precisa_nf && (
            <Badge variant="outline" className="text-xs">📋 NF</Badge>
          )}
          {!isAtivo && (
            <Badge variant="secondary" className="text-xs">Inativo</Badge>
          )}
        </div>
        <div className={cn('text-xs text-muted-foreground mt-0.5', isPago && 'text-green-500')}>
          {subtitle}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(cliente)} title="Editar">
            ✏️
          </Button>
        )}
        {onDuplicate && (
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(cliente)} title="Duplicar">
            <CopyIcon />
          </Button>
        )}
        {onCobrar && (
          <Button variant="ghost" size="sm" onClick={() => onCobrar(cliente)} title="Enviar cobrança por email">
            ✉️
          </Button>
        )}
        {onGerarNF && cliente.precisa_nf && (
          <Button variant="secondary" size="sm" onClick={() => onGerarNF(cliente)} title="Gerar NF">
            📄
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={() => onDelete(cliente)} title="Excluir">
            🗑️
          </Button>
        )}
      </div>
    </div>
  )
}

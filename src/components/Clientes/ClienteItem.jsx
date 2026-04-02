import { formatCurrency } from '../../utils/formatters'
import Badge from '../UI/Badge'
import { Pencil, Copy, Trash2, Mail, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            <Badge variant="outline" className="text-xs">NF</Badge>
          )}
          {!isAtivo && (
            <Badge variant="secondary" className="text-xs">Inativo</Badge>
          )}
        </div>
        <div className={cn('text-xs text-muted-foreground mt-0.5', isPago && 'text-green-500')}>
          {subtitle}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {onEdit && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onEdit(cliente)} title="Editar">
            <Pencil size={14} />
          </button>
        )}
        {onDuplicate && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onDuplicate(cliente)} title="Duplicar">
            <Copy size={14} />
          </button>
        )}
        {onCobrar && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onCobrar(cliente)} title="Enviar cobrança">
            <Mail size={14} />
          </button>
        )}
        {onGerarNF && cliente.precisa_nf && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => onGerarNF(cliente)} title="Gerar NF">
            <FileText size={14} />
          </button>
        )}
        {onDelete && (
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors" onClick={() => onDelete(cliente)} title="Excluir">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

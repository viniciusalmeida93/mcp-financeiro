import { formatCurrency } from '../../utils/formatters'
import Badge from '../UI/Badge'
import RowActions from '../UI/RowActions'
import { Pencil, Copy, Trash2, Mail, FileText, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ClienteItem({ cliente, parcelaDoMes, onTogglePago, onCobrar, onGerarNF, onEdit, onDuplicate, onDelete, isPago }) {
  const isAtivo = cliente.status === 'ativo'
  const isPontual = cliente.tipo === 'pontual'
  const qtdParcelas = Number(cliente.qtd_parcelas) || 1

  let dateInfo
  if (!isPontual) {
    dateInfo = `Dia ${cliente.dia_vencimento} · ${formatCurrency(cliente.valor)}/mês`
  } else if (parcelaDoMes && parcelaDoMes.parcela_total) {
    // Parcela cai neste mes: mostra a parcela atual com o valor dela
    const dia = parcelaDoMes.data ? parcelaDoMes.data.slice(8, 10) : ''
    dateInfo = `Dia ${dia} · ${formatCurrency(parcelaDoMes.valor)} · Parcela ${parcelaDoMes.parcela_atual}/${parcelaDoMes.parcela_total}`
  } else if (parcelaDoMes) {
    const dia = parcelaDoMes.data ? parcelaDoMes.data.slice(8, 10) : ''
    dateInfo = `Dia ${dia} · ${formatCurrency(parcelaDoMes.valor)}`
  } else if (qtdParcelas > 1) {
    dateInfo = `Pontual · ${qtdParcelas}x · Total ${formatCurrency(cliente.valor)}`
  } else {
    dateInfo = `Pontual · ${formatCurrency(cliente.valor)}`
  }

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
        onClick={() => onTogglePago && onTogglePago(cliente)}
        title={isPago ? 'Clique para desmarcar' : 'Marcar como recebido'}
      >
        {isPago && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap font-medium text-sm">
          {cliente.nome}
          <Badge variant={isPontual ? 'info-light' : 'primary-light'}>
            {isPontual ? 'Pontual' : 'Recorrente'}
          </Badge>
          {cliente.precisa_nf && (
            <Badge variant="warning-light">NF</Badge>
          )}
          {!isAtivo && (
            <Badge variant="secondary">Inativo</Badge>
          )}
        </div>
        <div className={cn('text-xs text-muted-foreground mt-0.5 flex items-center gap-1', isPago && 'text-success')}>
          {isPago && <><Check className="h-3 w-3" strokeWidth={3} /> Recebido · </>}
          {dateInfo}
        </div>
      </div>

      <RowActions
        actions={[
          onEdit && { icon: Pencil, label: 'Editar', onClick: () => onEdit(cliente) },
          onDuplicate && { icon: Copy, label: 'Duplicar', onClick: () => onDuplicate(cliente) },
          onCobrar && { icon: Mail, label: 'Enviar cobrança', onClick: () => onCobrar(cliente) },
          onGerarNF && cliente.precisa_nf && { icon: FileText, label: 'Gerar NF', onClick: () => onGerarNF(cliente) },
          onDelete && { icon: Trash2, label: 'Excluir', onClick: () => onDelete(cliente), destructive: true },
        ]}
      />
    </div>
  )
}

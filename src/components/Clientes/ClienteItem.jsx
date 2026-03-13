import { formatCurrency } from '../../utils/formatters'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="9" height="10" rx="1.5"/>
    <path d="M5 5V3.5A1.5 1.5 0 016.5 2H13A1.5 1.5 0 0114.5 3.5V10A1.5 1.5 0 0113 11.5H11"/>
  </svg>
)

export default function ClienteItem({ cliente, onTogglePago, onCobrar, onGerarNF, onEdit, onDuplicate, isPago }) {
  const isAtivo = cliente.status === 'ativo'
  const isPontual = cliente.tipo === 'pontual'

  const subtitle = isPago
    ? '✓ Recebido'
    : isPontual
      ? `Projeto pontual · ${formatCurrency(cliente.valor)}`
      : `Vence dia ${cliente.dia_vencimento} · ${formatCurrency(cliente.valor)}/mês`

  return (
    <div className={`list-item list-item--empresa ${isPago ? 'list-item--pago' : ''}`}>
      <button
        className={`dashboard-checkbox ${isPago ? 'dashboard-checkbox--checked' : ''}`}
        onClick={() => onTogglePago && onTogglePago(cliente)}
        title={isPago ? 'Clique para desmarcar' : 'Marcar como recebido'}
        style={{ marginRight: 'var(--spacing-sm)' }}
      >
        {isPago ? '✓' : ''}
      </button>

      <div className="list-item__body">
        <div className="list-item__title">
          {cliente.nome}
          <Badge variant={isPontual ? 'neutral' : 'info'} style={{ marginLeft: 6 }}>
            {isPontual ? 'Pontual' : 'Recorrente'}
          </Badge>
          {cliente.precisa_nf && (
            <Badge variant="warning" style={{ marginLeft: 4 }}>📋 NF</Badge>
          )}
          {!isAtivo && (
            <Badge variant="neutral" style={{ marginLeft: 4 }}>Inativo</Badge>
          )}
        </div>
        <div className="list-item__subtitle" style={{ color: isPago ? 'var(--color-success)' : undefined }}>
          {subtitle}
        </div>
      </div>

      <div className="list-item__actions">
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
      </div>
    </div>
  )
}

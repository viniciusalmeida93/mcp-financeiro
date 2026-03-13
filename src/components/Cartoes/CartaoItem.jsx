import { formatCurrency } from '../../utils/formatters'

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
  const utilizacaoClass = utilizacao >= 80 ? 'danger' : utilizacao >= 60 ? 'warning' : 'success'
  const bandeira = cartao.bandeira?.toLowerCase() || 'outro'

  return (
    <div className="cartao-item">
      <div className={`cartao-item__header cartao-card ${cartao.contexto === 'pessoal' ? 'cartao-card--pessoal' : ''}`}
        style={cartao.cor ? { background: `linear-gradient(135deg, ${cartao.cor} 0%, ${cartao.cor}cc 100%)` } : undefined}
      >
        <div className="cartao-card__chip">{BANDEIRA_ICONS[bandeira] || '💳'}</div>
        <div className="cartao-card__numero">•••• •••• •••• {cartao.numero_final}</div>
        <div className="cartao-card__footer">
          <div>
            <div className="cartao-card__label">Titular</div>
            <div className="cartao-card__nome">{cartao.nome}</div>
          </div>
          <div className="cartao-card__validade">
            <div className="cartao-card__label">Vence dia</div>
            <div className="cartao-card__nome">{cartao.vencimento_fatura}</div>
          </div>
          <div className="cartao-card__bandeira" style={{ textTransform: 'capitalize' }}>
            {cartao.bandeira}
          </div>
        </div>
      </div>

      <div className="cartao-item__body">
        <div className="cartao-stats">
          <div className="cartao-stat">
            <div className="cartao-stat__label">Limite</div>
            <div className="cartao-stat__value">{formatCurrency(cartao.limite)}</div>
          </div>
          <div className="cartao-stat">
            <div className="cartao-stat__label">Fatura Atual</div>
            <div className={`cartao-stat__value cartao-stat__value--${utilizacaoClass}`}>
              {formatCurrency(cartao.fatura_atual)}
            </div>
          </div>
        </div>

        <div className="cartao-utilizacao" style={{ marginTop: 12 }}>
          <div className="cartao-utilizacao__label">
            <span>Utilização</span>
            <span style={{ color: utilizacaoClass === 'danger' ? 'var(--color-danger)' : utilizacaoClass === 'warning' ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {utilizacao}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar__fill progress-bar__fill--${utilizacaoClass === 'danger' ? 'danger' : utilizacaoClass === 'warning' ? 'pessoal' : 'success'}`}
              style={{ width: `${Math.min(utilizacao, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="cartao-item__actions">
        <button className="btn btn--ghost btn--sm" onClick={() => onEdit(cartao)}>✏️ Editar</button>
        {onDuplicate && (
          <button className="btn btn--ghost btn--sm" onClick={() => onDuplicate(cartao)} title="Duplicar">
            <CopyIcon />
          </button>
        )}
        <button className="btn btn--ghost btn--sm" onClick={() => onDelete(cartao.id)}
          style={{ color: 'var(--color-danger)', marginLeft: 'auto' }}>
          🗑️ Excluir
        </button>
      </div>
    </div>
  )
}

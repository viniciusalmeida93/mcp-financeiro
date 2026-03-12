import { formatCurrency } from '../../utils/formatters'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

export default function ClienteItem({ cliente, onMarcarPago, onCobrar, onGerarNF, onEdit }) {
  const isAtivo = cliente.status === 'ativo'

  return (
    <div className="list-item list-item--empresa">
      <div className="list-item__body">
        <div className="list-item__title">
          {cliente.nome}
          {cliente.precisa_nf && (
            <Badge variant="warning" style={{ marginLeft: 6 }}>📋 NF</Badge>
          )}
          {!isAtivo && (
            <Badge variant="neutral" style={{ marginLeft: 6 }}>Inativo</Badge>
          )}
        </div>
        <div className="list-item__subtitle">
          Vence dia {cliente.dia_vencimento} · {formatCurrency(cliente.valor)}/mês
        </div>
      </div>

      <div className="list-item__actions">
        {onMarcarPago && (
          <Button variant="success" size="sm" onClick={() => onMarcarPago(cliente)} title="Marcar recebido">
            ✓
          </Button>
        )}
        {onCobrar && cliente.email_cobranca && (
          <Button variant="secondary" size="sm" onClick={() => onCobrar(cliente)} title="Enviar cobrança">
            ✉️
          </Button>
        )}
        {onGerarNF && cliente.precisa_nf && (
          <Button variant="secondary" size="sm" onClick={() => onGerarNF(cliente)} title="Gerar NF">
            📋
          </Button>
        )}
      </div>
    </div>
  )
}

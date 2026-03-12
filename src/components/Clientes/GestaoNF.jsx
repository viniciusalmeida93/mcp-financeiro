import { useState, useEffect } from 'react'
import Card from '../UI/Card'
import Button from '../UI/Button'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import { getNotasFiscais, updateNotaFiscal, gerarNFParaCliente } from '../../services/database'
import { enviarLembreteNF } from '../../services/email'
import { formatCurrency, formatDate, getCurrentMes, getLastNMeses, formatMesAno } from '../../utils/formatters'

export default function GestaoNF({ clientes }) {
  const [nfs, setNfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState(getCurrentMes())
  const meses = getLastNMeses(6)

  const fetchNFs = async () => {
    setLoading(true)
    try {
      const data = await getNotasFiscais({ mes })
      setNfs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNFs() }, [mes])

  const handleGerarNFs = async () => {
    const clientesNF = clientes.filter(c => c.precisa_nf && c.status === 'ativo')
    for (const cliente of clientesNF) {
      const jaExiste = nfs.some(nf => nf.cliente_id === cliente.id && nf.mes_referencia === mes)
      if (!jaExiste) {
        await gerarNFParaCliente(cliente, mes)
      }
    }
    fetchNFs()
  }

  const handleRegistrarEmissao = async (nf) => {
    const numero = prompt('Número da NF:')
    if (!numero) return
    await updateNotaFiscal(nf.id, {
      numero_nf: numero,
      data_emissao: new Date().toISOString().split('T')[0],
      status: 'emitida',
    })
    fetchNFs()
  }

  const handleMarcarPago = async (nf) => {
    await updateNotaFiscal(nf.id, { status: 'pago' })
    fetchNFs()
  }

  const handleEnviarLembrete = async (nf) => {
    try {
      await enviarLembreteNF(nf, nf.clientes?.nome ?? '')
      alert('Lembrete enviado!')
    } catch (err) {
      alert('Erro ao enviar: ' + err.message)
    }
  }

  const totalBruto = nfs.reduce((s, nf) => s + Number(nf.valor_bruto), 0)
  const totalImposto = nfs.reduce((s, nf) => s + Number(nf.valor_imposto), 0)
  const totalLiquido = nfs.reduce((s, nf) => s + Number(nf.valor_liquido), 0)

  const STATUS_LABEL = { pendente: '⏳ Pendente', emitida: '📄 Emitida', pago: '✅ Pago' }
  const STATUS_VARIANT = { pendente: 'warning', emitida: 'neutral', pago: 'success' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', alignItems: 'center' }}>
        <select
          value={mes}
          onChange={e => setMes(e.target.value)}
          style={{ flex: 1, height: 36 }}
        >
          {meses.map(m => <option key={m} value={m}>{formatMesAno(m)}</option>)}
        </select>
        <Button variant="secondary" size="sm" onClick={handleGerarNFs}>
          Gerar NFs do Mês
        </Button>
      </div>

      {loading ? <LoadingScreen /> : nfs.length === 0 ? (
        <EmptyState
          icon="📋"
          text="Nenhuma NF neste mês"
          subtext='Clique em "Gerar NFs do Mês" para criar as notas'
        />
      ) : (
        <>
          <Card>
            <div className="summary-row">
              <span className="summary-row__label">Total Bruto</span>
              <span className="summary-row__value">{formatCurrency(totalBruto)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-row__label">Total Impostos</span>
              <span className="summary-row__value" style={{ color: 'var(--color-danger)' }}>
                -{formatCurrency(totalImposto)}
              </span>
            </div>
            <div className="summary-row summary-row--total">
              <span className="summary-row__label">Total Líquido</span>
              <span className="summary-row__value amount--positive">{formatCurrency(totalLiquido)}</span>
            </div>
          </Card>

          {nfs.map(nf => (
            <Card key={nf.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{nf.clientes?.nome}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    Vence: {formatDate(nf.data_vencimento)}
                    {nf.numero_nf && ` · NF ${nf.numero_nf}`}
                  </div>
                </div>
                <span className={`badge badge--${STATUS_VARIANT[nf.status]}`}>
                  {STATUS_LABEL[nf.status]}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-row__label">Bruto</span>
                <span>{formatCurrency(nf.valor_bruto)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__label">Imposto ({nf.aliquota_imposto}%)</span>
                <span style={{ color: 'var(--color-danger)' }}>-{formatCurrency(nf.valor_imposto)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__label">Líquido</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatCurrency(nf.valor_liquido)}</span>
              </div>

              {nf.status !== 'pago' && (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                  <Button variant="secondary" size="sm" full onClick={() => handleEnviarLembrete(nf)}>
                    ✉️ Enviar Lembrete
                  </Button>
                  {nf.status === 'pendente' && (
                    <Button variant="secondary" size="sm" full onClick={() => handleRegistrarEmissao(nf)}>
                      📄 Registrar Emissão
                    </Button>
                  )}
                  <Button variant="success" size="sm" full onClick={() => handleMarcarPago(nf)}>
                    ✓ Marcar como Pago
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </>
      )}
    </div>
  )
}

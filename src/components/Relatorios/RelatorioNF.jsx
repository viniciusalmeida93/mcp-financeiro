import { useState, useEffect } from 'react'
import Card from '../UI/Card'
import Button from '../UI/Button'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import { getNotasFiscais } from '../../services/database'
import { formatCurrency, formatDate, getLastNMeses, formatMesAno, getCurrentMes } from '../../utils/formatters'

export default function RelatorioNF() {
  const [mes, setMes] = useState(getCurrentMes())
  const [nfs, setNfs] = useState([])
  const [loading, setLoading] = useState(true)
  const meses = getLastNMeses(13)

  useEffect(() => {
    const fetch = async () => {
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
    fetch()
  }, [mes])

  const totalBruto = nfs.reduce((s, nf) => s + Number(nf.valor_bruto), 0)
  const totalImposto = nfs.reduce((s, nf) => s + Number(nf.valor_imposto), 0)
  const totalLiquido = nfs.reduce((s, nf) => s + Number(nf.valor_liquido), 0)

  const exportCSV = () => {
    const rows = [
      ['Cliente', 'Mês Ref.', 'Valor Bruto', 'Alíquota', 'Imposto', 'Valor Líquido', 'Status', 'Nº NF', 'Vencimento'],
      ...nfs.map(nf => [
        nf.clientes?.nome ?? '',
        nf.mes_referencia,
        nf.valor_bruto,
        `${nf.aliquota_imposto}%`,
        nf.valor_imposto,
        nf.valor_liquido,
        nf.status,
        nf.numero_nf ?? '',
        nf.data_vencimento,
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nfs-${mes}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const STATUS_LABEL = { pendente: '⏳ Pendente', emitida: '📄 Emitida', pago: '✅ Pago' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', alignItems: 'center' }}>
        <select value={mes} onChange={e => setMes(e.target.value)} style={{ flex: 1, height: 36 }}>
          {meses.map(m => <option key={m} value={m}>{formatMesAno(m)}</option>)}
        </select>
        {nfs.length > 0 && (
          <Button variant="secondary" size="sm" onClick={exportCSV}>📥 CSV</Button>
        )}
      </div>

      {loading ? <LoadingScreen /> : nfs.length === 0 ? (
        <EmptyState icon="📋" text="Nenhuma NF neste mês" />
      ) : (
        <>
          <Card>
            <div className="summary-row"><span className="summary-row__label">Total Bruto</span><span className="summary-row__value">{formatCurrency(totalBruto)}</span></div>
            <div className="summary-row"><span className="summary-row__label">Total Impostos</span><span className="summary-row__value amount--negative">-{formatCurrency(totalImposto)}</span></div>
            <div className="summary-row summary-row--total"><span className="summary-row__label">Total Líquido</span><span className="summary-row__value amount--positive">{formatCurrency(totalLiquido)}</span></div>
          </Card>

          {nfs.map(nf => (
            <Card key={nf.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600 }}>{nf.clientes?.nome}</div>
                <span className={`badge badge--${nf.status === 'pago' ? 'success' : nf.status === 'emitida' ? 'neutral' : 'warning'}`}>
                  {STATUS_LABEL[nf.status]}
                </span>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Vence: {formatDate(nf.data_vencimento)} {nf.numero_nf && `· NF ${nf.numero_nf}`}
              </div>
              <div className="summary-row" style={{ marginTop: 8 }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Bruto → Líquido</span>
                <span style={{ fontSize: 'var(--font-size-sm)' }}>
                  {formatCurrency(nf.valor_bruto)} → <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatCurrency(nf.valor_liquido)}</span>
                </span>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import Button from '../UI/Button'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import Select from '../UI/Select'
import Badge from '../UI/Badge'
import { getNotasFiscais } from '../../services/database'
import { formatCurrency, formatDate, getLastNMeses, formatMesAno, getCurrentMes } from '../../utils/formatters'
import { cn } from '@/lib/utils'

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
    <div className="space-y-4 mt-2">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Select
            options={meses.map(m => ({ value: m, label: formatMesAno(m) }))}
            value={mes}
            onChange={e => setMes(e.target.value)}
          />
        </div>
        {nfs.length > 0 && (
          <Button variant="secondary" size="sm" onClick={exportCSV}>📥 CSV</Button>
        )}
      </div>

      {loading ? <LoadingScreen /> : nfs.length === 0 ? (
        <EmptyState icon="📋" text="Nenhuma NF neste mês" />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Bruto</span>
                <span className="font-medium">{formatCurrency(totalBruto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Impostos</span>
                <span className="font-medium text-red-500">-{formatCurrency(totalImposto)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total Líquido</span>
                <span className="text-green-500">{formatCurrency(totalLiquido)}</span>
              </div>
            </CardContent>
          </Card>

          {nfs.map(nf => (
            <Card key={nf.id}>
              <CardContent className="py-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-sm">{nf.clientes?.nome}</div>
                  <Badge variant={nf.status === 'pago' ? 'success' : nf.status === 'emitida' ? 'neutral' : 'warning'}>
                    {STATUS_LABEL[nf.status]}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Vence: {formatDate(nf.data_vencimento)} {nf.numero_nf && `· NF ${nf.numero_nf}`}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bruto → Líquido</span>
                  <span>
                    {formatCurrency(nf.valor_bruto)} → <span className="text-green-500 font-semibold">{formatCurrency(nf.valor_liquido)}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}

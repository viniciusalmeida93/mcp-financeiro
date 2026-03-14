import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '../UI/Card'
import Button from '../UI/Button'
import Badge from '../UI/Badge'
import LoadingScreen from '../UI/LoadingScreen'
import EmptyState from '../UI/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../UI/tabs'
import { getNotasFiscais, updateNotaFiscal, gerarNFParaCliente } from '../../services/database'
import { enviarLembreteNF } from '../../services/email'
import { formatCurrency, formatDate, getCurrentMes, getLastNMeses, formatMesAno } from '../../utils/formatters'

export default function GestaoNF({ clientes }) {
  const [nfs, setNfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [mes, setMes] = useState(getCurrentMes())
  const [nfTab, setNfTab] = useState('todas')
  const meses = getLastNMeses(6)

  const fetchNFs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getNotasFiscais({ mes })
      setNfs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { fetchNFs() }, [fetchNFs])

  const handleGerarNFs = async () => {
    const clientesNF = clientes.filter(c => c.precisa_nf && c.status === 'ativo')
    setGenerating(true)
    try {
      await Promise.all(
        clientesNF
          .filter(c => !nfs.some(nf => nf.cliente_id === c.id && nf.mes_referencia === mes))
          .map(c => gerarNFParaCliente(c, mes))
      )
      await fetchNFs()
    } catch (err) {
      alert('Erro ao gerar NFs: ' + err.message)
    } finally {
      setGenerating(false)
    }
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
  const STATUS_BADGE_VARIANT = { pendente: 'outline', emitida: 'secondary', pago: 'default' }

  const filteredNfs = nfTab === 'todas' ? nfs : nfs.filter(nf => nf.status === nfTab)

  const renderNFCard = (nf) => (
    <Card key={nf.id} className="mb-3">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-semibold text-sm">{nf.clientes?.nome}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Vence: {formatDate(nf.data_vencimento)}
              {nf.numero_nf && ` · NF ${nf.numero_nf}`}
            </div>
          </div>
          <Badge variant={STATUS_BADGE_VARIANT[nf.status]}>
            {STATUS_LABEL[nf.status]}
          </Badge>
        </div>

        <div className="space-y-1.5 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bruto</span>
            <span>{formatCurrency(nf.valor_bruto)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Imposto ({nf.aliquota_imposto}%)</span>
            <span className="text-destructive">-{formatCurrency(nf.valor_imposto)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-muted-foreground">Líquido</span>
            <span className="text-green-600">{formatCurrency(nf.valor_liquido)}</span>
          </div>
        </div>

        {nf.status !== 'pago' && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleEnviarLembrete(nf)}>
              ✉️ Enviar Lembrete
            </Button>
            {nf.status === 'pendente' && (
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleRegistrarEmissao(nf)}>
                📄 Registrar Emissão
              </Button>
            )}
            <Button variant="default" size="sm" className="flex-1" onClick={() => handleMarcarPago(nf)}>
              ✓ Marcar como Pago
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div>
      <div className="flex gap-2 mb-4 items-center">
        <select
          value={mes}
          onChange={e => setMes(e.target.value)}
          className="flex-1 h-9 text-sm px-2 rounded-md border border-input bg-background"
        >
          {meses.map(m => <option key={m} value={m}>{formatMesAno(m)}</option>)}
        </select>
        <Button variant="secondary" size="sm" onClick={handleGerarNFs} disabled={generating}>
          {generating ? 'Gerando...' : 'Gerar NFs do Mês'}
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
          {/* Summary totals */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bruto</span>
                  <span className="font-semibold">{formatCurrency(totalBruto)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Impostos</span>
                  <span className="text-destructive font-semibold">-{formatCurrency(totalImposto)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">Total Líquido</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalLiquido)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs by status */}
          <Tabs value={nfTab} onValueChange={setNfTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="todas">Todas ({nfs.length})</TabsTrigger>
              <TabsTrigger value="pendente">
                ⏳ Pendente ({nfs.filter(n => n.status === 'pendente').length})
              </TabsTrigger>
              <TabsTrigger value="emitida">
                📄 Emitida ({nfs.filter(n => n.status === 'emitida').length})
              </TabsTrigger>
              <TabsTrigger value="pago">
                ✅ Pago ({nfs.filter(n => n.status === 'pago').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredNfs.length === 0 ? (
            <EmptyState icon="📋" text="Nenhuma NF nesta categoria" />
          ) : (
            filteredNfs.map(renderNFCard)
          )}
        </>
      )}
    </div>
  )
}

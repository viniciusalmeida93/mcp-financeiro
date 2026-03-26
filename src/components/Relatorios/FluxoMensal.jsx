import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import LoadingScreen from '../UI/LoadingScreen'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { useMes } from '../../contexts/MesContext'
import { useFluxoMensal } from '../../hooks/useRelatorios'

export default function FluxoMensal() {
  const { mes } = useMes()
  const { data, loading, error } = useFluxoMensal(mes)

  return (
    <div className="space-y-4 mt-2">

      {loading ? <LoadingScreen /> : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : data && (
        <>
          {/* Empresa block */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">💼 Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receitas</span>
                <span className="font-semibold text-green-500">{formatCurrency(data.receitasEmpresa)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Despesas</span>
                <span className="font-semibold text-red-500">-{formatCurrency(data.despesasEmpresa)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Saldo</span>
                <span className={data.receitasEmpresa - data.despesasEmpresa >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatCurrency(data.receitasEmpresa - data.despesasEmpresa)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pessoal block */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">🏠 Pessoal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receitas</span>
                <span className="font-semibold text-green-500">{formatCurrency(data.receitasPessoal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Despesas</span>
                <span className="font-semibold text-red-500">-{formatCurrency(data.despesasPessoal)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Saldo</span>
                <span className={data.receitasPessoal - data.despesasPessoal >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatCurrency(data.receitasPessoal - data.despesasPessoal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Consolidated */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">📊 Consolidado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Receitas</span>
                <span className="font-semibold text-green-500">{formatCurrency(data.totalReceitas)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Despesas</span>
                <span className="font-semibold text-red-500">-{formatCurrency(data.totalDespesas)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Saldo Final</span>
                <span className={data.saldoFinal >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatCurrency(data.saldoFinal)}
                </span>
              </div>
              <div className={`text-center text-sm mt-1 ${data.margemLucro >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                Margem: {formatPercent(data.margemLucro)}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

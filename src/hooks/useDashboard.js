import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { getDiasRestantesNoMes, getProximoVencimento, toDateString } from '../utils/dateHelpers'
import { format, addDays } from 'date-fns'

export function useDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    saldoEmpresa: 0,
    saldoPessoal: 0,
    saldoTotal: 0,
    receitasEmpresa: 0,
    receitasPessoal: 0,
    despesasFixasEmpresa: 0,
    despesasFixasPessoal: 0,
    diasRestantes: 0,
    proximasContas: [],
    clientesAReceber: [],
  })

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const hoje = new Date()
      const mesAtual = format(hoje, 'yyyy-MM')
      const inicioMes = `${mesAtual}-01`
      const fimSemana = toDateString(addDays(hoje, 7))
      const hojeStr = toDateString(hoje)

      // Fetch current month lancamentos
      const { data: lancamentos, error: lErr } = await supabase
        .from('lancamentos')
        .select('*')
        .gte('data', inicioMes)
        .lte('data', `${mesAtual}-31`)

      if (lErr) throw lErr

      // Fetch active despesas_fixas
      const { data: despesas, error: dErr } = await supabase
        .from('despesas_fixas')
        .select('*')
        .eq('status', 'ativo')

      if (dErr) throw dErr

      // Fetch active clients
      const { data: clientes, error: cErr } = await supabase
        .from('clientes')
        .select('*')
        .eq('status', 'ativo')
        .eq('tipo', 'mensal')

      if (cErr) throw cErr

      // Calculate totals from lancamentos
      const receitasEmpresa = lancamentos
        .filter(l => l.contexto === 'empresa' && l.tipo === 'entrada')
        .reduce((s, l) => s + Number(l.valor), 0)

      const receitasPessoal = lancamentos
        .filter(l => l.contexto === 'pessoal' && l.tipo === 'entrada')
        .reduce((s, l) => s + Number(l.valor), 0)

      const gastosEmpresa = lancamentos
        .filter(l => l.contexto === 'empresa' && l.tipo === 'saida')
        .reduce((s, l) => s + Number(l.valor), 0)

      const gastosPessoal = lancamentos
        .filter(l => l.contexto === 'pessoal' && l.tipo === 'saida')
        .reduce((s, l) => s + Number(l.valor), 0)

      // Fixed expenses this month
      const despesasFixasEmpresa = despesas
        .filter(d => d.contexto === 'empresa')
        .reduce((s, d) => s + Number(d.valor), 0)

      const despesasFixasPessoal = despesas
        .filter(d => d.contexto === 'pessoal')
        .reduce((s, d) => s + Number(d.valor), 0)

      const saldoEmpresa = receitasEmpresa - gastosEmpresa
      const saldoPessoal = receitasPessoal - gastosPessoal

      // Upcoming bills (next 7 days)
      const proximasContas = despesas
        .map(d => ({
          ...d,
          proximoVencimento: getProximoVencimento(d.dia_vencimento),
        }))
        .filter(d => {
          const venc = toDateString(d.proximoVencimento)
          return venc >= hojeStr && venc <= fimSemana
        })
        .sort((a, b) => a.proximoVencimento - b.proximoVencimento)

      // Clients to receive (next 7 days)
      const clientesAReceber = clientes
        .map(c => ({
          ...c,
          proximoVencimento: getProximoVencimento(c.dia_vencimento),
        }))
        .filter(c => {
          const venc = toDateString(c.proximoVencimento)
          return venc >= hojeStr && venc <= fimSemana
        })
        .sort((a, b) => a.proximoVencimento - b.proximoVencimento)

      setData({
        saldoEmpresa,
        saldoPessoal,
        saldoTotal: saldoEmpresa + saldoPessoal,
        receitasEmpresa,
        receitasPessoal,
        despesasFixasEmpresa,
        despesasFixasPessoal,
        diasRestantes: getDiasRestantesNoMes(),
        proximasContas,
        clientesAReceber,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  return { ...data, loading, error, refresh: fetchDashboard }
}

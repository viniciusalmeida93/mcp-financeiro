import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { getDiasRestantesNoMes, getProximoVencimento, toDateString } from '../utils/dateHelpers'
import { createLancamento } from '../services/database'
import { getCategoriaLabel } from '../constants/categorias'
import { format, addDays, getDaysInMonth } from 'date-fns'

function getLastDayOfMes(mes) {
  const [year, month] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(year, month - 1))).padStart(2, '0')}`
}

export function useDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    saldoEmpresa: 0,
    saldoPessoal: 0,
    saldoTotal: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    economia: 0,
    receitasEmpresa: 0,
    receitasPessoal: 0,
    despesasFixasEmpresa: 0,
    despesasFixasPessoal: 0,
    diasRestantes: 0,
    proximasContas: [],
    clientesAReceber: [],
    pagosNomes: new Set(),
    pagosClienteIds: new Set(),
    categoriasDespesas: [],
    ultimasTransacoes: [],
    evolucaoDiaria: [],
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

      // Fetch current month lancamentos (with client name)
      const { data: lancamentos, error: lErr } = await supabase
        .from('lancamentos')
        .select('*, clientes(nome)')
        .gte('data', inicioMes)
        .lte('data', getLastDayOfMes(mesAtual))
        .order('data', { ascending: false })

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

      const totalReceitas = receitasEmpresa + receitasPessoal
      const totalDespesas = gastosEmpresa + gastosPessoal
      const economia = totalReceitas > 0
        ? Math.round(((totalReceitas - totalDespesas) / totalReceitas) * 100)
        : 0

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

      const pagosNomes = new Set(
        lancamentos.filter(l => l.tipo === 'saida').map(l => l.descricao)
      )
      const pagosClienteIds = new Set(
        lancamentos.filter(l => l.tipo === 'entrada' && l.cliente_id).map(l => l.cliente_id)
      )

      // Top categories by despesas
      const catMap = {}
      lancamentos
        .filter(l => l.tipo === 'saida')
        .forEach(l => {
          const key = l.categoria || 'outros'
          catMap[key] = (catMap[key] || 0) + Number(l.valor)
        })
      const categoriasDespesas = Object.entries(catMap)
        .map(([categoria, total]) => ({
          categoria,
          label: getCategoriaLabel(categoria),
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
        .map(c => ({ ...c, percentual: totalDespesas > 0 ? (c.total / totalDespesas) * 100 : 0 }))

      // Last 8 transactions
      const ultimasTransacoes = lancamentos.slice(0, 8)

      // Daily evolution for chart (days 1..lastDay of month)
      const lastDay = getDaysInMonth(new Date(hoje.getFullYear(), hoje.getMonth()))
      const dailyMap = {}
      lancamentos.forEach(l => {
        const day = l.data.slice(8, 10) // DD from YYYY-MM-DD
        if (!dailyMap[day]) dailyMap[day] = { receitas: 0, despesas: 0 }
        if (l.tipo === 'entrada') dailyMap[day].receitas += Number(l.valor)
        if (l.tipo === 'saida') dailyMap[day].despesas += Number(l.valor)
      })
      const evolucaoDiaria = []
      for (let d = 1; d <= Math.min(lastDay, hoje.getDate()); d++) {
        const key = String(d).padStart(2, '0')
        evolucaoDiaria.push({
          dia: `${d}`,
          receitas: dailyMap[key]?.receitas || 0,
          despesas: dailyMap[key]?.despesas || 0,
        })
      }

      setData({
        saldoEmpresa,
        saldoPessoal,
        saldoTotal: saldoEmpresa + saldoPessoal,
        totalReceitas,
        totalDespesas,
        economia,
        receitasEmpresa,
        receitasPessoal,
        despesasFixasEmpresa,
        despesasFixasPessoal,
        diasRestantes: getDiasRestantesNoMes(),
        proximasContas,
        clientesAReceber,
        pagosNomes,
        pagosClienteIds,
        categoriasDespesas,
        ultimasTransacoes,
        evolucaoDiaria,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const marcarContaPaga = useCallback(async (conta) => {
    await createLancamento({
      tipo: 'saida',
      valor: conta.valor,
      descricao: conta.nome,
      categoria: conta.categoria,
      forma_pagamento: conta.forma_pagamento,
      data: toDateString(new Date()),
      contexto: conta.contexto,
    })
    fetchDashboard()
  }, [fetchDashboard])

  const marcarClienteRecebido = useCallback(async (cliente) => {
    await createLancamento({
      tipo: 'entrada',
      valor: cliente.valor,
      descricao: cliente.nome,
      categoria: 'receita_servico',
      forma_pagamento: 'transferencia',
      data: toDateString(new Date()),
      contexto: 'empresa',
      cliente_id: cliente.id,
    })
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  return { ...data, loading, error, refresh: fetchDashboard, marcarContaPaga, marcarClienteRecebido }
}

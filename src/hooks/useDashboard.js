import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { getDiasRestantesNoMes, toDateString } from '../utils/dateHelpers'
import { getDespesasFixas, getClientes, getCartoes, createLancamento, deleteLancamento } from '../services/database'
import { getCategoriaLabel } from '../constants/categorias'
import { format, addDays, getDaysInMonth } from 'date-fns'
import { calcParcelaNoMes, despesaEncerrada } from '../utils/cicloFatura'

function getLastDayOfMes(mes) {
  const [year, month] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(year, month - 1))).padStart(2, '0')}`
}

function getMesDaPontual(despesa, cartoes) {
  if (!despesa.created_at) return null
  const created = new Date(despesa.created_at)
  const createdYear = created.getFullYear()
  const createdMonth = created.getMonth() + 1
  const createdDay = created.getDate()
  let mesAno = `${createdYear}-${String(createdMonth).padStart(2, '0')}`
  if (despesa.forma_pagamento?.startsWith('cartao:')) {
    const cartaoId = despesa.forma_pagamento.replace('cartao:', '')
    const cartao = cartoes.find(c => c.id === cartaoId)
    if (cartao?.dia_fechamento && createdDay > cartao.dia_fechamento) {
      let nextMonth = createdMonth + 1
      let nextYear = createdYear
      if (nextMonth > 12) { nextMonth = 1; nextYear++ }
      mesAno = `${nextYear}-${String(nextMonth).padStart(2, '0')}`
    }
  }
  return mesAno
}

function despesaNoMes(d, mes, cartoes) {
  if (despesaEncerrada(d, mes)) return false
  if (d.recorrencia === 'parcela') return calcParcelaNoMes(d, mes, cartoes) !== null
  if (d.recorrencia === 'pontual') {
    if (d.mes_referencia) return d.mes_referencia === mes
    return getMesDaPontual(d, cartoes) === mes
  }
  return true
}

export function useDashboard(mes) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    saldoTotal: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    receitaEsperada: 0,
    despesaEsperada: 0,
    despesasPagasTotal: 0,
    economia: 0,
    diasRestantes: 0,
    proximasContas: [],
    clientesAReceber: [],
    pagosIds: new Set(),
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
      const mesAtual = mes || format(hoje, 'yyyy-MM')
      const inicioMes = `${mesAtual}-01`
      const hojeStr = toDateString(hoje)
      const [mesAno, mesNum] = mesAtual.split('-').map(Number)
      const isCurrentMes = mesAtual === format(hoje, 'yyyy-MM')

      const [lancamentos_res, despesasData, clientesData, cartoesData] = await Promise.all([
        supabase
          .from('lancamentos')
          .select('*, clientes(nome)')
          .gte('data', inicioMes)
          .lte('data', getLastDayOfMes(mesAtual))
          .order('data', { ascending: false }),
        getDespesasFixas({ status: 'ativo' }),
        getClientes({ status: 'ativo' }),
        getCartoes(),
      ])

      const lancamentos = lancamentos_res.data || []
      if (lancamentos_res.error) throw lancamentos_res.error

      const clientes = clientesData.filter(c => c.tipo === 'mensal')

      // Despesas do mês (com ciclo do cartão)
      const despDoMes = despesasData.filter(d => despesaNoMes(d, mesAtual, cartoesData))

      // Receitas e gastos dos lançamentos
      const totalReceitas = lancamentos
        .filter(l => l.tipo === 'entrada')
        .reduce((s, l) => s + Number(l.valor), 0)

      const totalDespesas = lancamentos
        .filter(l => l.tipo === 'saida')
        .reduce((s, l) => s + Number(l.valor), 0)

      // Esperados do mês
      const receitaEsperada = clientes.reduce((s, c) => s + Number(c.valor), 0)
      const despesaEsperada = despDoMes.reduce((s, d) => s + Number(d.valor), 0)

      // Pagos - mapear por despesa_id e fallback por nome
      const pagosIds = new Set()
      const lancMapById = {}
      lancamentos.filter(l => l.tipo === 'saida').forEach(l => {
        if (l.despesa_id) {
          pagosIds.add(l.despesa_id)
          lancMapById[l.despesa_id] = l.id
        } else {
          const desp = despesasData.find(d => d.nome === l.descricao)
          if (desp) {
            pagosIds.add(desp.id)
            lancMapById[desp.id] = l.id
          }
        }
      })

      const despesasPagasTotal = despDoMes
        .filter(d => pagosIds.has(d.id))
        .reduce((s, d) => s + Number(d.valor), 0)

      // Clientes recebidos
      const pagosClienteIds = new Set(
        lancamentos.filter(l => l.tipo === 'entrada' && l.cliente_id).map(l => l.cliente_id)
      )

      // Próximas contas do mês
      const proximasContas = despDoMes
        .map(d => {
          const dia = d.dia_vencimento || 1
          const vencimento = new Date(mesAno, mesNum - 1, dia)
          return { ...d, proximoVencimento: vencimento }
        })
        .filter(d => {
          if (isCurrentMes) {
            const venc = toDateString(d.proximoVencimento)
            const fimSemana = toDateString(addDays(hoje, 7))
            return venc >= hojeStr && venc <= fimSemana
          }
          return true
        })
        .sort((a, b) => a.proximoVencimento - b.proximoVencimento)

      // Clientes a receber
      const clientesAReceber = clientes
        .map(c => {
          const dia = c.dia_vencimento || 1
          const vencimento = new Date(mesAno, mesNum - 1, dia)
          return { ...c, proximoVencimento: vencimento }
        })
        .filter(c => {
          if (isCurrentMes) {
            const venc = toDateString(c.proximoVencimento)
            const fimSemana = toDateString(addDays(hoje, 7))
            return venc >= hojeStr && venc <= fimSemana
          }
          return true
        })
        .sort((a, b) => a.proximoVencimento - b.proximoVencimento)

      // Top categorias despesas
      const catMap = {}
      despDoMes.forEach(d => {
        const key = d.categoria || 'outros'
        catMap[key] = (catMap[key] || 0) + Number(d.valor)
      })
      const categoriasDespesas = Object.entries(catMap)
        .map(([categoria, total]) => ({
          categoria,
          label: getCategoriaLabel(categoria),
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
        .map(c => ({ ...c, percentual: despesaEsperada > 0 ? (c.total / despesaEsperada) * 100 : 0 }))

      const ultimasTransacoes = lancamentos.slice(0, 8)

      // Evolução diária
      const lastDay = getDaysInMonth(new Date(mesAno, mesNum - 1))
      const maxDay = isCurrentMes ? Math.min(lastDay, hoje.getDate()) : lastDay
      const dailyMap = {}
      lancamentos.forEach(l => {
        const day = l.data.slice(8, 10)
        if (!dailyMap[day]) dailyMap[day] = { receitas: 0, despesas: 0 }
        if (l.tipo === 'entrada') dailyMap[day].receitas += Number(l.valor)
        if (l.tipo === 'saida') dailyMap[day].despesas += Number(l.valor)
      })
      const evolucaoDiaria = []
      for (let d = 1; d <= maxDay; d++) {
        const key = String(d).padStart(2, '0')
        evolucaoDiaria.push({
          dia: `${d}`,
          receitas: dailyMap[key]?.receitas || 0,
          despesas: dailyMap[key]?.despesas || 0,
        })
      }

      const saldoTotal = totalReceitas - despesasPagasTotal
      const economia = totalReceitas > 0
        ? Math.round(((totalReceitas - despesasPagasTotal) / totalReceitas) * 100)
        : 0

      setData({
        saldoTotal,
        totalReceitas,
        totalDespesas,
        receitaEsperada,
        despesaEsperada,
        despesasPagasTotal,
        economia,
        diasRestantes: getDiasRestantesNoMes(),
        proximasContas,
        clientesAReceber,
        pagosIds,
        pagosClienteIds,
        categoriasDespesas,
        ultimasTransacoes,
        evolucaoDiaria,
        _lancMapById: lancMapById,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mes])

  const marcarContaPaga = useCallback(async (conta) => {
    const mesAtual = mes || format(new Date(), 'yyyy-MM')
    const [mesAno, mesNum] = mesAtual.split('-').map(Number)
    const dia = conta.dia_vencimento || new Date().getDate()
    const dataLanc = `${mesAtual}-${String(Math.min(dia, getDaysInMonth(new Date(mesAno, mesNum - 1)))).padStart(2, '0')}`
    await createLancamento({
      tipo: 'saida',
      valor: conta.valor,
      descricao: conta.nome,
      categoria: conta.categoria,
      forma_pagamento: conta.forma_pagamento,
      data: dataLanc,
      contexto: conta.contexto,
      despesa_id: conta.id,
    })
    fetchDashboard()
  }, [fetchDashboard, mes])

  const desmarcarContaPaga = useCallback(async (conta) => {
    // Tentar pelo lancMapById primeiro
    let lancId = data._lancMapById?.[conta.id]
    if (!lancId) {
      const mesAtual = mes || format(new Date(), 'yyyy-MM')
      const { data: rows } = await supabase
        .from('lancamentos')
        .select('id')
        .eq('tipo', 'saida')
        .eq('descricao', conta.nome)
        .gte('data', `${mesAtual}-01`)
        .lte('data', getLastDayOfMes(mesAtual))
        .limit(1)
      lancId = rows?.[0]?.id
    }
    if (lancId) {
      await deleteLancamento(lancId)
      fetchDashboard()
    }
  }, [fetchDashboard, mes, data._lancMapById])

  const marcarClienteRecebido = useCallback(async (cliente) => {
    const mesAtual = mes || format(new Date(), 'yyyy-MM')
    const [mesAno, mesNum] = mesAtual.split('-').map(Number)
    const dia = cliente.dia_vencimento || new Date().getDate()
    const dataLanc = `${mesAtual}-${String(Math.min(dia, getDaysInMonth(new Date(mesAno, mesNum - 1)))).padStart(2, '0')}`
    await createLancamento({
      tipo: 'entrada',
      valor: cliente.valor,
      descricao: cliente.nome,
      categoria: 'receita_servico',
      forma_pagamento: 'transferencia',
      data: dataLanc,
      contexto: cliente.contexto || 'empresa',
      cliente_id: cliente.id,
    })
    fetchDashboard()
  }, [fetchDashboard, mes])

  const desmarcarClienteRecebido = useCallback(async (cliente) => {
    const mesAtual = mes || format(new Date(), 'yyyy-MM')
    const { data: rows } = await supabase
      .from('lancamentos')
      .select('id')
      .eq('tipo', 'entrada')
      .eq('cliente_id', cliente.id)
      .gte('data', `${mesAtual}-01`)
      .lte('data', getLastDayOfMes(mesAtual))
      .limit(1)
    if (rows?.[0]) {
      await deleteLancamento(rows[0].id)
      fetchDashboard()
    }
  }, [fetchDashboard, mes])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  return { ...data, loading, error, refresh: fetchDashboard, marcarContaPaga, desmarcarContaPaga, marcarClienteRecebido, desmarcarClienteRecebido }
}

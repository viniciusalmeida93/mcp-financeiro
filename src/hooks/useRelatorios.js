import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { getCurrentMes, getLastNMeses } from '../utils/formatters'
import { getDaysInMonth } from 'date-fns'

function getLastDayOfMes(mes) {
  const [year, month] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(year, month - 1))).padStart(2, '0')}`
}

export function useFluxoMensal(mes) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!mes) return
    setLoading(true)
    setError(null)
    try {
      const [lancRes, despRes] = await Promise.all([
        supabase.from('lancamentos').select('*').gte('data', `${mes}-01`).lte('data', getLastDayOfMes(mes)),
        supabase.from('despesas_fixas').select('*').eq('status', 'ativo'),
      ])

      if (lancRes.error) throw lancRes.error
      if (despRes.error) throw despRes.error

      const lancs = lancRes.data
      const desps = despRes.data

      const receitasEmpresa = lancs.filter(l => l.contexto === 'empresa' && l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
      const receitasPessoal = lancs.filter(l => l.contexto === 'pessoal' && l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
      const despesasEmpresa = lancs.filter(l => l.contexto === 'empresa' && l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)
      const despesasPessoal = lancs.filter(l => l.contexto === 'pessoal' && l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)
      const fixasEmpresa = desps.filter(d => d.contexto === 'empresa').reduce((s, d) => s + Number(d.valor), 0)
      const fixasPessoal = desps.filter(d => d.contexto === 'pessoal').reduce((s, d) => s + Number(d.valor), 0)

      const totalReceitas = receitasEmpresa + receitasPessoal
      const totalDespesas = despesasEmpresa + despesasPessoal + fixasEmpresa + fixasPessoal
      const saldoFinal = totalReceitas - totalDespesas
      const margemLucro = totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0

      setData({
        receitasEmpresa,
        receitasPessoal,
        despesasEmpresa: despesasEmpresa + fixasEmpresa,
        despesasPessoal: despesasPessoal + fixasPessoal,
        totalReceitas,
        totalDespesas,
        saldoFinal,
        margemLucro,
        lancamentos: lancs,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, error, refresh: fetch }
}

export function useHistoricoMensal() {
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistorico = async () => {
      const meses = getLastNMeses(12)
      const results = []
      for (const mes of meses) {
        const { data: lancs } = await supabase
          .from('lancamentos')
          .select('tipo, valor, contexto')
          .gte('data', `${mes}-01`)
          .lte('data', getLastDayOfMes(mes))

        if (lancs) {
          const receitas = lancs.filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
          const despesas = lancs.filter(l => l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)
          results.push({ mes, receitas, despesas, saldo: receitas - despesas })
        }
      }
      setHistorico(results.reverse())
      setLoading(false)
    }
    fetchHistorico()
  }, [])

  return { historico, loading }
}

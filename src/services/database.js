import { supabase } from './supabase'
import { format, addMonths } from 'date-fns'

// ================================
// LANCAMENTOS
// ================================

export async function getLancamentos({ mes, contexto, tipo, categoria, search } = {}) {
  let query = supabase
    .from('lancamentos')
    .select('*, clientes(nome)')
    .order('data', { ascending: false })

  if (mes) {
    query = query.gte('data', `${mes}-01`).lte('data', `${mes}-31`)
  }
  if (contexto && contexto !== 'todos') {
    query = query.eq('contexto', contexto)
  }
  if (tipo && tipo !== 'todos') {
    query = query.eq('tipo', tipo)
  }
  if (categoria) {
    query = query.eq('categoria', categoria)
  }
  if (search) {
    query = query.ilike('descricao', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createLancamento(lancamento) {
  const { data, error } = await supabase
    .from('lancamentos')
    .insert([lancamento])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createLancamentosParcelados(base, numeroParcelas) {
  // Create grupo_parcela first
  const grupo = {
    descricao: base.descricao,
    valor_total: base.valor,
    valor_parcela: base.valor / numeroParcelas,
    total_parcelas: numeroParcelas,
    parcelas_pagas: 0,
    forma_pagamento: base.forma_pagamento,
    data_inicio: base.data,
    data_fim: format(addMonths(new Date(base.data), numeroParcelas - 1), 'yyyy-MM-dd'),
    contexto: base.contexto,
  }

  const { data: grupoData, error: grupoErr } = await supabase
    .from('grupos_parcelas')
    .insert([grupo])
    .select()
    .single()

  if (grupoErr) throw grupoErr

  // Create individual parcel entries
  const parcelas = []
  for (let i = 0; i < numeroParcelas; i++) {
    const dataParc = format(addMonths(new Date(base.data), i), 'yyyy-MM-dd')
    parcelas.push({
      ...base,
      data: dataParc,
      parcelado: true,
      parcela_atual: i + 1,
      parcela_total: numeroParcelas,
      valor_parcela: base.valor / numeroParcelas,
      grupo_parcela_id: grupoData.id,
      valor: base.valor / numeroParcelas,
    })
  }

  const { data, error } = await supabase
    .from('lancamentos')
    .insert(parcelas)
    .select()

  if (error) throw error
  return { grupo: grupoData, lancamentos: data }
}

export async function deleteLancamento(id) {
  const { error } = await supabase.from('lancamentos').delete().eq('id', id)
  if (error) throw error
}

export async function deleteGrupoParcelas(grupoParcela_id) {
  const { error } = await supabase
    .from('lancamentos')
    .delete()
    .eq('grupo_parcela_id', grupoParcela_id)
  if (error) throw error

  const { error: ge } = await supabase
    .from('grupos_parcelas')
    .delete()
    .eq('id', grupoParcela_id)
  if (ge) throw ge
}

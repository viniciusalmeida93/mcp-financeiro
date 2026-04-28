import { supabase } from './supabase'
import { format, addMonths, getDaysInMonth } from 'date-fns'

function getLastDayOfMes(mes) {
  const [year, month] = mes.split('-').map(Number)
  return `${mes}-${String(getDaysInMonth(new Date(year, month - 1))).padStart(2, '0')}`
}

// ================================
// LANCAMENTOS
// ================================

export async function getLancamentos({ mes, contexto, tipo, categoria, search, forma_pagamento } = {}) {
  let query = supabase
    .from('lancamentos')
    .select('*, clientes(nome)')
    .order('data', { ascending: false })

  if (mes) {
    query = query.gte('data', `${mes}-01`).lte('data', getLastDayOfMes(mes))
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
  if (forma_pagamento && forma_pagamento !== 'todos') {
    query = query.eq('forma_pagamento', forma_pagamento)
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

// ================================
// CLIENTES
// ================================

export async function getClientes({ status } = {}) {
  let query = supabase.from('clientes').select('*').order('dia_vencimento', { ascending: true })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createCliente(cliente) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([cliente])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCliente(id, updates) {
  const { data, error } = await supabase
    .from('clientes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}

// ================================
// NOTAS FISCAIS
// ================================

export async function getNotasFiscais({ clienteId, mes, status } = {}) {
  let query = supabase
    .from('notas_fiscais')
    .select('*, clientes(nome, email_cobranca)')
    .order('data_vencimento', { ascending: true })
  if (clienteId) query = query.eq('cliente_id', clienteId)
  if (mes) query = query.eq('mes_referencia', mes)
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createNotaFiscal(nf) {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .insert([nf])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNotaFiscal(id, updates) {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function gerarNFParaCliente(cliente, mesReferencia) {
  const { calcularNF } = await import('./calculations.js')
  const { bruto, imposto, liquido } = calcularNF(cliente.valor, cliente.aliquota_imposto ?? 5)

  // Due date = client's payment day in the given month
  const [ano, mes] = mesReferencia.split('-')
  const dataVencimento = `${ano}-${mes}-${String(cliente.dia_vencimento).padStart(2, '0')}`

  return createNotaFiscal({
    cliente_id: cliente.id,
    mes_referencia: mesReferencia,
    valor_bruto: bruto,
    aliquota_imposto: cliente.aliquota_imposto ?? 5,
    valor_imposto: imposto,
    valor_liquido: liquido,
    data_vencimento: dataVencimento,
    status: 'pendente',
  })
}

// ================================
// DESPESAS FIXAS
// ================================

export async function getDespesasFixas({ contexto, status } = {}) {
  let query = supabase
    .from('despesas_fixas')
    .select('*')
    .order('dia_vencimento', { ascending: true })

  if (contexto && contexto !== 'todos') query = query.eq('contexto', contexto)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createDespesaFixa(despesa) {
  const { data, error } = await supabase
    .from('despesas_fixas')
    .insert([despesa])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDespesaFixa(id, updates) {
  const { data, error } = await supabase
    .from('despesas_fixas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Soft-end: marca data_termino no primeiro dia do mês informado.
// Preserva lançamentos passados (vinculados via despesa_id) e mantém a despesa
// visível em meses anteriores; só não aparece a partir do mês de término.
export async function deleteDespesaFixa(id, mes) {
  const dataTermino = mes ? `${mes}-01` : new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from('despesas_fixas')
    .update({ data_termino: dataTermino })
    .eq('id', id)
  if (error) throw error
}

// ================================
// CARTÕES
// ================================

export async function getCartoes({ contexto } = {}) {
  let query = supabase
    .from('cartoes')
    .select('*')
    .order('nome', { ascending: true })
  if (contexto && contexto !== 'todos') query = query.eq('contexto', contexto)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createCartao(cartao) {
  const { data, error } = await supabase
    .from('cartoes')
    .insert([cartao])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCartao(id, updates) {
  const { data, error } = await supabase
    .from('cartoes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCartao(id) {
  const { error } = await supabase.from('cartoes').delete().eq('id', id)
  if (error) throw error
}

// ================================
// CATEGORIAS CUSTOMIZADAS
// ================================

export async function getCategoriasCustomizadas() {
  const { data, error } = await supabase
    .from('categorias_customizadas')
    .select('*')
    .order('nome', { ascending: true })
  if (error) throw error
  return data
}

export async function createCategoriaCustomizada(categoria) {
  const { data, error } = await supabase
    .from('categorias_customizadas')
    .insert([categoria])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategoriaCustomizada(id, updates) {
  const { data, error } = await supabase
    .from('categorias_customizadas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategoriaCustomizada(id) {
  const { error } = await supabase.from('categorias_customizadas').delete().eq('id', id)
  if (error) throw error
}

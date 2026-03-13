export const FORMAS_PAGAMENTO_BASE = [
  { value: 'pix', label: 'PIX' },
  { value: 'debito', label: 'Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'dinheiro', label: 'Dinheiro' },
]

// Legacy alias
export const FORMAS_PAGAMENTO = FORMAS_PAGAMENTO_BASE

export function buildFormasPagamento(cartoes = []) {
  const cartaoOpts = cartoes.map(c => ({
    value: `cartao:${c.id}`,
    label: `${c.nome} (Crédito)`,
  }))
  return [...FORMAS_PAGAMENTO_BASE, ...cartaoOpts]
}

export function getFormaPagamentoLabel(value, cartoes = []) {
  const all = buildFormasPagamento(cartoes)
  return all.find(f => f.value === value)?.label ?? value
}

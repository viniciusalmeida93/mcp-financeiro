export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'PIX' },
  { value: 'master', label: 'Master (Crédito)' },
  { value: 'passai', label: 'Passaí (Crédito)' },
  { value: 'debito', label: 'Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'dinheiro', label: 'Dinheiro' },
]

export const getFormaPagamentoLabel = (value) => {
  return FORMAS_PAGAMENTO.find(f => f.value === value)?.label ?? value
}

import { useState } from 'react'

const BANDEIRAS = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Outro']
const COR_OPTIONS = [
  { label: 'Azul Escuro', value: '#1f507a' },
  { label: 'Azul Royal', value: '#2563EB' },
  { label: 'Roxo', value: '#7030A0' },
  { label: 'Rosa', value: '#DB2777' },
  { label: 'Vermelho', value: '#DC2626' },
  { label: 'Laranja', value: '#FF6B35' },
  { label: 'Amarelo', value: '#D97706' },
  { label: 'Verde Escuro', value: '#1a6b3c' },
  { label: 'Verde', value: '#16A34A' },
  { label: 'Teal', value: '#0D9488' },
  { label: 'Cinza', value: '#374151' },
  { label: 'Preto', value: '#111827' },
]

const EMPTY = {
  nome: '',
  bandeira: 'Visa',
  numero_final: '',
  limite: '',
  fatura_atual: '',
  vencimento_fatura: '',
  contexto: 'empresa',
  cor: '#1f507a',
}

export default function NovoCartao({ cartao, onSave, onClose }) {
  const [form, setForm] = useState(cartao ? {
    ...cartao,
    limite: String(cartao.limite),
    fatura_atual: String(cartao.fatura_atual),
    vencimento_fatura: String(cartao.vencimento_fatura),
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const validate = () => {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!form.numero_final || form.numero_final.length !== 4) e.numero_final = '4 dígitos finais obrigatórios'
    if (!form.limite || isNaN(form.limite)) e.limite = 'Limite inválido'
    if (!form.vencimento_fatura || Number(form.vencimento_fatura) < 1 || Number(form.vencimento_fatura) > 31)
      e.vencimento_fatura = 'Dia de vencimento inválido (1-31)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        nome: form.nome.trim(),
        bandeira: form.bandeira,
        numero_final: form.numero_final,
        limite: parseFloat(form.limite),
        fatura_atual: parseFloat(form.fatura_atual || '0'),
        vencimento_fatura: parseInt(form.vencimento_fatura),
        contexto: form.contexto,
        cor: form.cor,
      })
      onClose()
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__handle" />
        <div className="modal__header">
          <h2 className="modal__title">{cartao ? 'Editar Cartão' : 'Novo Cartão'}</h2>
          <button className="modal__close btn btn--ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required">Apelido / Banco</label>
            <input value={form.nome} onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Nubank, Itaú Gold" />
            {errors.nome && <span className="form-error">{errors.nome}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Bandeira</label>
              <select value={form.bandeira} onChange={e => set('bandeira', e.target.value)}>
                {BANDEIRAS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-label--required">4 últimos dígitos</label>
              <input value={form.numero_final}
                onChange={e => set('numero_final', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000" maxLength={4} />
              {errors.numero_final && <span className="form-error">{errors.numero_final}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Limite (R$)</label>
              <input type="number" min="0" step="0.01" value={form.limite}
                onChange={e => set('limite', e.target.value)} placeholder="5000.00" />
              {errors.limite && <span className="form-error">{errors.limite}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Fatura Atual (R$)</label>
              <input type="number" min="0" step="0.01" value={form.fatura_atual}
                onChange={e => set('fatura_atual', e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Dia vencimento fatura</label>
              <input type="number" min="1" max="31" value={form.vencimento_fatura}
                onChange={e => set('vencimento_fatura', e.target.value)} placeholder="10" />
              {errors.vencimento_fatura && <span className="form-error">{errors.vencimento_fatura}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Contexto</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 4 }}>
                {[
                  { value: 'empresa', label: '💼 Empresa' },
                  { value: 'pessoal', label: '🏠 Pessoal' },
                  { value: 'ambos', label: '🔄 Ambos' },
                ].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: form.contexto === opt.value ? 600 : 400 }}>
                    <input
                      type="radio"
                      name="contexto_cartao"
                      value={opt.value}
                      checked={form.contexto === opt.value}
                      onChange={() => set('contexto', opt.value)}
                      style={{ accentColor: 'var(--color-empresa-primary)' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cor do cartão</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COR_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => set('cor', opt.value)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: opt.value,
                    border: form.cor === opt.value ? '3px solid var(--color-text)' : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {errors.submit && <p className="form-error" style={{ marginBottom: 12 }}>{errors.submit}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Salvando...' : cartao ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

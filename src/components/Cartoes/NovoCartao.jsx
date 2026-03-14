import { useState } from 'react'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import Select from '../UI/Select'
import Button from '../UI/Button'

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
    <Modal isOpen={true} onClose={onClose} title={cartao ? 'Editar Cartão' : 'Novo Cartão'}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Apelido / Banco"
          required
          placeholder="Ex: Nubank, Itaú Gold"
          value={form.nome}
          onChange={e => set('nome', e.target.value)}
          error={errors.nome}
        />

        <div className="form-row">
          <Select
            label="Bandeira"
            options={BANDEIRAS.map(b => ({ value: b, label: b }))}
            value={form.bandeira}
            onChange={e => set('bandeira', e.target.value)}
          />
          <Input
            label="4 últimos dígitos"
            required
            placeholder="0000"
            maxLength={4}
            value={form.numero_final}
            onChange={e => set('numero_final', e.target.value.replace(/\D/g, '').slice(0, 4))}
            error={errors.numero_final}
          />
        </div>

        <div className="form-row">
          <Input
            label="Limite (R$)"
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="5000.00"
            value={form.limite}
            onChange={e => set('limite', e.target.value)}
            error={errors.limite}
          />
          <Input
            label="Fatura Atual (R$)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.fatura_atual}
            onChange={e => set('fatura_atual', e.target.value)}
          />
        </div>

        <div className="form-row">
          <Input
            label="Dia vencimento fatura"
            required
            type="number"
            min="1"
            max="31"
            placeholder="10"
            value={form.vencimento_fatura}
            onChange={e => set('vencimento_fatura', e.target.value)}
            error={errors.vencimento_fatura}
          />
          <div className="form-group">
            <label className="form-label">Contexto</label>
            <div className="flex gap-4 mt-1">
              {[
                { value: 'empresa', label: '💼 Empresa' },
                { value: 'pessoal', label: '🏠 Pessoal' },
                { value: 'ambos', label: '🔄 Ambos' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-1.5 cursor-pointer text-sm ${form.contexto === opt.value ? 'font-semibold' : ''}`}>
                  <input
                    type="radio"
                    name="contexto_cartao"
                    value={opt.value}
                    checked={form.contexto === opt.value}
                    onChange={() => set('contexto', opt.value)}
                    className="accent-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Cor do cartão</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {COR_OPTIONS.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => set('cor', opt.value)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: opt.value,
                  border: form.cor === opt.value ? '3px solid hsl(var(--foreground))' : '3px solid transparent',
                  cursor: 'pointer',
                }}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        {errors.submit && <p className="text-destructive text-sm mb-3">{errors.submit}</p>}

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : cartao ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

import { useState, useEffect } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Select from '../UI/Select'
import { createCliente, updateCliente, createLancamento, createCategoriaCustomizada, getCategoriasCustomizadas } from '../../services/database'
import { formatCurrency } from '../../utils/formatters'

const TIPOS = [
  { value: 'mensal', label: 'Recorrente (Mensal)' },
  { value: 'pontual', label: 'Pontual (Projeto)' },
]

const STATUS_OPTS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
]

const EMPTY_FORM = {
  nome: '',
  email_cobranca: '',
  valor: '',
  dia_vencimento: '',
  tipo: 'mensal',
  status: 'ativo',
  servico: '',
  precisa_nf: false,
  aliquota_imposto: 5,
  valor_entrada: '',
  qtd_parcelas: 2,
  contexto: 'empresa',
}

function calcParcelaValor(index, total, entrada, qtd) {
  const t = Number(total) || 0
  const e = Number(entrada) || 0
  const q = Number(qtd) || 1
  if (e > 0 && q > 1) {
    if (index === 0) return e
    return (t - e) / (q - 1)
  }
  return t / q
}

export default function NovoCliente({ isOpen, onClose, onSuccess, clienteEdit }) {
  const isEditing = !!clienteEdit
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(clienteEdit ?? EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [parcelas, setParcelas] = useState([{ data: '' }, { data: '' }])

  const [categorias, setCategorias] = useState([])
  const [showAddCat, setShowAddCat] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [savingCat, setSavingCat] = useState(false)

  useEffect(() => {
    getCategoriasCustomizadas().then(data => setCategorias(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      if (clienteEdit) {
        setForm({
          nome: clienteEdit.nome || '',
          email_cobranca: clienteEdit.email_cobranca || '',
          valor: clienteEdit.valor || '',
          dia_vencimento: clienteEdit.dia_vencimento || '',
          tipo: clienteEdit.tipo || 'mensal',
          status: clienteEdit.status || 'ativo',
          servico: clienteEdit.servico || '',
          precisa_nf: clienteEdit.precisa_nf || false,
          aliquota_imposto: clienteEdit.aliquota_imposto || 5,
          valor_entrada: '',
          qtd_parcelas: 2,
          contexto: clienteEdit.contexto || 'empresa',
        })
      } else {
        setForm(EMPTY_FORM)
        setParcelas([{ data: '' }, { data: '' }])
      }
    }
  }, [isOpen, clienteEdit])

  useEffect(() => {
    const qtd = Number(form.qtd_parcelas) || 1
    setParcelas(prev => {
      const arr = [...prev]
      while (arr.length < qtd) arr.push({ data: '' })
      return arr.slice(0, qtd)
    })
  }, [form.qtd_parcelas])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const setParcelaData = (i, data) => {
    setParcelas(prev => prev.map((p, idx) => idx === i ? { ...p, data } : p))
  }

  const validate = () => {
    const errs = {}
    if (!form.nome.trim() || form.nome.trim().length < 2) errs.nome = 'Nome deve ter pelo menos 2 caracteres'
    if (form.email_cobranca && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_cobranca)) {
      errs.email_cobranca = 'Email inválido'
    }
    if (!form.valor || Number(form.valor) <= 0) errs.valor = 'Valor deve ser maior que zero'
    if (form.tipo === 'mensal') {
      if (!form.dia_vencimento || Number(form.dia_vencimento) < 1 || Number(form.dia_vencimento) > 31) {
        errs.dia_vencimento = 'Dia deve ser entre 1 e 31'
      }
    } else {
      parcelas.forEach((p, i) => {
        if (!p.data) errs[`parcela_${i}`] = 'Informe a data'
      })
    }
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        nome: form.nome.trim(),
        email_cobranca: form.email_cobranca || null,
        valor: Number(form.valor),
        dia_vencimento: form.tipo === 'mensal' ? Number(form.dia_vencimento) : null,
        tipo: form.tipo,
        status: form.status,
        servico: form.servico || null,
        precisa_nf: form.precisa_nf,
        aliquota_imposto: Number(form.aliquota_imposto) || 5,
        contexto: form.contexto,
      }

      if (isEditing) {
        await updateCliente(clienteEdit.id, payload)
      } else {
        const novoCliente = await createCliente(payload)
        if (form.tipo === 'pontual') {
          const qtd = Number(form.qtd_parcelas) || 1
          for (let i = 0; i < parcelas.length; i++) {
            const valor = calcParcelaValor(i, form.valor, form.valor_entrada, qtd)
            await createLancamento({
              tipo: 'entrada',
              valor,
              descricao: form.nome,
              categoria: form.servico || 'receita_servico',
              data: parcelas[i].data,
              contexto: form.contexto,
              cliente_id: novoCliente.id,
            })
          }
        }
      }

      setErrors({})
      onSuccess?.()
      onClose()
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) return
    setSavingCat(true)
    try {
      const criada = await createCategoriaCustomizada({ nome: novaCategoria.trim(), tipo: 'receita', cor: '#1f507a' })
      const data = await getCategoriasCustomizadas()
      setCategorias(data)
      set('servico', criada.nome)
      setNovaCategoria('')
      setShowAddCat(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingCat(false)
    }
  }

  const isPontual = form.tipo === 'pontual'
  const qtd = Number(form.qtd_parcelas) || 1
  const categoriasReceita = categorias.filter(c => c.tipo === 'receita')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}>

      {/* Contexto */}
      <div className="form-group">
        <label className="form-label">Contexto</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 4 }}>
          {[{ value: 'empresa', label: '💼 Empresa' }, { value: 'pessoal', label: '🏠 Pessoal' }].map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: form.contexto === opt.value ? 600 : 400 }}>
              <input
                type="radio"
                name="contexto_cliente"
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

      <Input
        label="Nome"
        required
        placeholder="Nome do cliente"
        value={form.nome}
        onChange={e => set('nome', e.target.value)}
        error={errors.nome}
      />

      <Input
        label="Email de Cobrança"
        type="email"
        placeholder="email@cliente.com"
        value={form.email_cobranca || ''}
        onChange={e => set('email_cobranca', e.target.value)}
        error={errors.email_cobranca}
      />

      <div className="form-row">
        <Select
          label="Tipo"
          options={TIPOS}
          value={form.tipo}
          onChange={e => set('tipo', e.target.value)}
        />
        <Select
          label="Status"
          options={STATUS_OPTS}
          value={form.status}
          onChange={e => set('status', e.target.value)}
        />
      </div>

      <div className="form-row">
        <Input
          label={isPontual ? 'Valor Total do Projeto (R$)' : 'Valor Mensal (R$)'}
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          value={form.valor}
          onChange={e => set('valor', e.target.value)}
          error={errors.valor}
        />
        {!isPontual && (
          <Input
            label="Dia Vencimento"
            required
            type="number"
            min="1"
            max="31"
            placeholder="1-31"
            value={form.dia_vencimento}
            onChange={e => set('dia_vencimento', e.target.value)}
            error={errors.dia_vencimento}
          />
        )}
      </div>

      {isPontual && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Parcelamento
          </div>

          <div className="form-row">
            <Input
              label="Valor de Entrada (R$)"
              type="number"
              step="0.01"
              min="0"
              placeholder="Opcional"
              value={form.valor_entrada || ''}
              onChange={e => set('valor_entrada', e.target.value)}
            />
            <Input
              label="Número de Parcelas"
              type="number"
              min="1"
              max="24"
              placeholder="2"
              value={form.qtd_parcelas}
              onChange={e => set('qtd_parcelas', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {parcelas.map((p, i) => {
              const valor = calcParcelaValor(i, form.valor, form.valor_entrada, qtd)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--color-empresa-bg)',
                    color: 'var(--color-empresa-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <input
                    type="date"
                    value={p.data}
                    onChange={e => setParcelaData(i, e.target.value)}
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                    {Number(form.valor) > 0 ? formatCurrency(valor) : 'R$ -'}
                  </span>
                  {errors[`parcela_${i}`] && (
                    <span style={{ color: 'var(--color-danger)', fontSize: 11 }}>*</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Categoria dropdown — somente receitas */}
      <div className="form-group">
        <label className="form-label">Categoria</label>
        <select
          className="select"
          value={form.servico || ''}
          onChange={e => {
            if (e.target.value === '__add__') {
              setShowAddCat(true)
            } else {
              set('servico', e.target.value)
              setShowAddCat(false)
            }
          }}
        >
          <option value="">Selecione uma categoria...</option>
          {categoriasReceita.map(c => (
            <option key={c.id} value={c.nome}>{c.nome}</option>
          ))}
          <option value="__add__">+ Adicionar nova categoria</option>
        </select>

        {showAddCat && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              className="input"
              placeholder="Nome da categoria"
              value={novaCategoria}
              onChange={e => setNovaCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategoria()}
              autoFocus
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              onClick={handleAddCategoria}
              disabled={savingCat}
              style={{ flexShrink: 0 }}
            >
              {savingCat ? '...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 hover:bg-accent hover:text-accent-foreground"
              onClick={() => { setShowAddCat(false); setNovaCategoria('') }}
              style={{ flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="precisa_nf"
          checked={form.precisa_nf}
          onChange={e => set('precisa_nf', e.target.checked)}
        />
        <label htmlFor="precisa_nf">Precisa de Nota Fiscal</label>
      </div>

      {form.precisa_nf && (
        <Input
          label="Alíquota Imposto (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={form.aliquota_imposto}
          onChange={e => set('aliquota_imposto', e.target.value)}
        />
      )}

      {errors.submit && <div className="form-error" style={{ marginBottom: 8 }}>{errors.submit}</div>}

      <div className="form-actions">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="default" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </Modal>
  )
}

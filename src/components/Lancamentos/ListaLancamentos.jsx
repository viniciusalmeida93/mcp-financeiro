import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import LancamentoItem from './LancamentoItem'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import SelectField from '../UI/Select'
import { Card, CardContent } from '@/components/UI/Card'
import { getCartoes } from '../../services/database'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/UI/alert-dialog'
import { formatCurrency } from '../../utils/formatters'
import { deleteLancamento, deleteGrupoParcelas } from '../../services/database'

const CONTEXTO_OPTIONS = [
  { value: 'todos', label: 'Tudo' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'pessoal', label: 'Pessoal' },
]

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'entrada', label: 'Entradas' },
  { value: 'saida', label: 'Saídas' },
]

export default function ListaLancamentos({ lancamentos, loading, filters, updateFilter, refresh }) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showParcelasDialog, setShowParcelasDialog] = useState(false)
  const [cartoes, setCartoes] = useState([])

  useEffect(() => {
    getCartoes({}).then(setCartoes).catch(() => {})
  }, [])

  const formaPagamentoOptions = [
    { value: 'todos', label: 'Todas formas' },
    { value: 'pix', label: 'PIX' },
    { value: 'debito', label: 'Débito' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'transferencia', label: 'Transferência' },
    ...cartoes.map(c => ({ value: `cartao:${c.id}`, label: c.nome })),
  ]

  const handleDeleteRequest = (lancamento) => {
    setDeleteTarget(lancamento)
    if (lancamento.grupo_parcela_id) {
      setShowParcelasDialog(true)
    }
  }

  const handleDeleteConfirm = async (deleteAll = false) => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.grupo_parcela_id && deleteAll) {
        await deleteGrupoParcelas(deleteTarget.grupo_parcela_id)
      } else {
        await deleteLancamento(deleteTarget.id)
      }
      refresh()
      toast.success('Lançamento excluído!')
    } catch (err) {
      toast.error('Erro ao excluir: ' + err.message)
    } finally {
      setDeleteTarget(null)
      setShowParcelasDialog(false)
    }
  }

  const totalEntradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + Number(l.valor), 0)
  const totalSaidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + Number(l.valor), 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Buscar lançamento..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <SelectField
          options={formaPagamentoOptions}
          value={filters.forma_pagamento || 'todos'}
          onValueChange={v => updateFilter('forma_pagamento', v)}
          placeholder="Forma de pagamento"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          options={CONTEXTO_OPTIONS}
          value={filters.contexto}
          onValueChange={v => updateFilter('contexto', v)}
        />
        <SelectField
          options={TIPO_OPTIONS}
          value={filters.tipo}
          onValueChange={v => updateFilter('tipo', v)}
        />
      </div>

      {/* Summary */}
      {!loading && lancamentos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-card p-3 shadow-sm text-center">
            <div className="text-xs text-muted-foreground mb-1">Entradas</div>
            <div className="text-sm font-semibold text-green-500">{formatCurrency(totalEntradas)}</div>
          </div>
          <div className="rounded-lg border bg-card p-3 shadow-sm text-center">
            <div className="text-xs text-muted-foreground mb-1">Saídas</div>
            <div className="text-sm font-semibold text-red-500">{formatCurrency(totalSaidas)}</div>
          </div>
          <div className="rounded-lg border bg-card p-3 shadow-sm text-center">
            <div className="text-xs text-muted-foreground mb-1">Saldo</div>
            <div className={`text-sm font-semibold ${totalEntradas - totalSaidas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalEntradas - totalSaidas)}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingScreen />
      ) : lancamentos.length === 0 ? (
        <EmptyState icon={FileText} text="Nenhum lançamento encontrado" />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          {lancamentos.map(l => (
            <LancamentoItem key={l.id} lancamento={l} onDelete={handleDeleteRequest} />
          ))}
        </div>
      )}

      {/* Delete dialogs */}
      {deleteTarget?.grupo_parcela_id ? (
        <AlertDialog open={showParcelasDialog} onOpenChange={setShowParcelasDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir parcelas</AlertDialogTitle>
              <AlertDialogDescription>
                "{deleteTarget?.descricao}" é parcelada. Excluir todas ou apenas esta?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel onClick={() => { setDeleteTarget(null); setShowParcelasDialog(false) }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction variant="outline" onClick={() => handleDeleteConfirm(false)}>
                Só esta
              </AlertDialogAction>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDeleteConfirm(true)}
              >
                Todas
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog open={!!deleteTarget && !deleteTarget?.grupo_parcela_id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Excluir "{deleteTarget?.descricao}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDeleteConfirm(false)}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

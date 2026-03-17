import { useState } from 'react'
import { toast } from 'sonner'
import LancamentoItem from './LancamentoItem'
import ContextToggle from '../UI/ContextToggle'
import EmptyState from '../UI/EmptyState'
import LoadingScreen from '../UI/LoadingScreen'
import { Card, CardContent } from '@/components/UI/Card'
import { Input } from '@/components/UI/Input'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/UI/tabs'
import { formatCurrency } from '../../utils/formatters'
import { deleteLancamento, deleteGrupoParcelas } from '../../services/database'
import { Search } from 'lucide-react'

const TIPOS_FILTER = [
  { value: 'todos', label: 'Todos' },
  { value: 'entrada', label: 'Entradas' },
  { value: 'saida', label: 'Saídas' },
]

export default function ListaLancamentos({ lancamentos, loading, filters, updateFilter, refresh }) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showParcelasDialog, setShowParcelasDialog] = useState(false)

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
      {/* Context toggle */}
      <ContextToggle value={filters.contexto} onChange={v => updateFilter('contexto', v)} />

      {/* Type filter tabs */}
      <Tabs value={filters.tipo} onValueChange={v => updateFilter('tipo', v)}>
        <TabsList className="w-full">
          {TIPOS_FILTER.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="flex-1">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar lançamento..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />
      </div>

      {/* Summary */}
      {!loading && lancamentos.length > 0 && (
        <Card>
          <CardContent className="py-3 px-4 flex justify-between">
            <span className="text-sm font-semibold text-green-500">↑ {formatCurrency(totalEntradas)}</span>
            <span className="text-sm font-semibold text-red-500">↓ {formatCurrency(totalSaidas)}</span>
            <span className="text-sm font-semibold">= {formatCurrency(totalEntradas - totalSaidas)}</span>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <LoadingScreen />
      ) : lancamentos.length === 0 ? (
        <EmptyState icon="📝" text="Nenhum lançamento encontrado" subtext="Tente ajustar os filtros ou adicione um novo lançamento" />
      ) : (
        <Card>
          <CardContent className="p-0">
            {lancamentos.map(l => (
              <LancamentoItem key={l.id} lancamento={l} onDelete={handleDeleteRequest} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delete single / all parcelas dialog */}
      {deleteTarget?.grupo_parcela_id ? (
        <AlertDialog open={showParcelasDialog} onOpenChange={setShowParcelasDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir parcelas</AlertDialogTitle>
              <AlertDialogDescription>
                "{deleteTarget?.descricao}" é uma compra parcelada. Deseja excluir todas as parcelas ou apenas esta?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel onClick={() => { setDeleteTarget(null); setShowParcelasDialog(false) }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="outline"
                onClick={() => handleDeleteConfirm(false)}
              >
                Só esta
              </AlertDialogAction>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDeleteConfirm(true)}
              >
                Todas as parcelas
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
                Excluir "{deleteTarget?.descricao}"? Esta ação não pode ser desfeita.
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

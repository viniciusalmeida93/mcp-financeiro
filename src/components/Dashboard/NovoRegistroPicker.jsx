import Modal from '../UI/Modal'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function NovoRegistroPicker({ isOpen, onClose, onSelectReceita, onSelectDespesa }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O que deseja adicionar?">
      <div className="grid grid-cols-2 gap-4 py-2">
        <button
          onClick={() => { onClose(); onSelectReceita() }}
          className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp size={24} className="text-green-500" />
          </div>
          <span className="font-semibold text-green-500">Receita</span>
        </button>
        <button
          onClick={() => { onClose(); onSelectDespesa() }}
          className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <TrendingDown size={24} className="text-red-500" />
          </div>
          <span className="font-semibold text-red-500">Despesa</span>
        </button>
      </div>
    </Modal>
  )
}

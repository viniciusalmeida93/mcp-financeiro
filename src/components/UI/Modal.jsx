import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/UI/dialog'

// Modal não fecha por clique fora ou Escape — só pelo botão X, Cancelar ou Salvar.
export default function Modal({ isOpen, onClose, title, children, footer }) {
  return (
    <Dialog
      open={isOpen}
      disablePointerDismissal
      onOpenChange={(open, details) => {
        if (!open && details?.reason === 'escapeKey') return
        if (!open) onClose()
      }}
    >
      <DialogContent className="w-[calc(100%-32px)] max-w-md mx-auto">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="py-2">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

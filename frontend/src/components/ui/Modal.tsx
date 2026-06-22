import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: string
  disabled?: boolean
}

export default function Modal({ open, onClose, children, maxWidth = 'max-w-md', disabled = false }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !disabled && onClose()}
      />
      {/* Content */}
      <div className={`relative glass p-6 w-full ${maxWidth}`}>
        <button
          onClick={onClose}
          disabled={disabled}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 transition-colors
            cursor-pointer bg-transparent border-0 text-text-muted hover:text-text-primary
            disabled:opacity-50"
          aria-label="Fechar modal"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

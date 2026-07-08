import { type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  loading?: boolean
  icon?: ReactNode
}

const variantConfig = {
  danger: { icon: <AlertCircle size={24} />, color: 'var(--error)', bg: 'var(--error-bg)', btnVariant: 'destructive' as const },
  warning: { icon: <AlertCircle size={24} />, color: 'var(--warning)', bg: 'var(--warning-bg)', btnVariant: 'primary' as const },
  info: { icon: <HelpCircle size={24} />, color: 'var(--info)', bg: 'var(--info-bg)', btnVariant: 'primary' as const },
  success: { icon: <CheckCircle size={24} />, color: 'var(--success)', bg: 'var(--success-bg)', btnVariant: 'primary' as const },
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  icon,
}: DialogProps) {
  const config = variantConfig[variant]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center animate-fade-in"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          {icon ?? config.icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
          {description && <p className="text-sm text-[var(--text-3)] mt-1">{description}</p>}
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={config.btnVariant} fullWidth onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Re-export AnimatePresence for convenience
export { AnimatePresence }

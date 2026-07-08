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
  danger: { icon: <AlertCircle size={24} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', btnVariant: 'destructive' as const },
  warning: { icon: <AlertCircle size={24} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', btnVariant: 'primary' as const },
  info: { icon: <HelpCircle size={24} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', btnVariant: 'primary' as const },
  success: { icon: <CheckCircle size={24} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)', btnVariant: 'primary' as const },
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
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          {icon ?? config.icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#f0f0f5]">{title}</h3>
          {description && <p className="text-sm text-[#8888a0] mt-1">{description}</p>}
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

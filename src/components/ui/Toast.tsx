import { type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastContext } from '@/contexts/ToastContext'
import { cn } from '@/utils/cn'
import type { ToastType } from '@/types'

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
}

const styles: Record<ToastType, string> = {
  success: 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.3)] text-[#10b981]',
  error: 'bg-[rgba(244,63,94,0.15)] border-[rgba(244,63,94,0.3)] text-[#f43f5e]',
  warning: 'bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]',
  info: 'bg-[rgba(59,130,246,0.15)] border-[rgba(59,130,246,0.3)] text-[#3b82f6]',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 48, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 48, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={cn(
              'pointer-events-auto min-w-[260px] max-w-[340px] rounded-xl border p-3.5',
              'flex items-start gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
              'backdrop-blur-xl bg-opacity-90',
              styles[toast.type]
            )}
          >
            <span className="flex-shrink-0 mt-0.5">{icons[toast.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#f0f0f5]">{toast.title}</p>
              {toast.description && <p className="text-xs text-[#8888a0] mt-0.5">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-[#55556a] hover:text-[#8888a0] transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

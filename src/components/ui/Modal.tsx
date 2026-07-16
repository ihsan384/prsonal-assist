import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Modal({ isOpen, onClose, title, subtitle, children, footer, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[size]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className={cn(
        'relative w-full rounded-[14px] bg-[var(--bg)] border border-[var(--border)] shadow-[var(--shadow-modal)] z-10 animate-fade-in flex flex-col max-h-[calc(100dvh-2rem)]',
        sizeClass,
        className
      )}>
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-[var(--border)] shrink-0">
            <div>
              {title && <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>}
              {subtitle && <p className="text-xs text-[var(--text-3)] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-[6px] text-[var(--text-4)] hover:text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-4 py-4 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

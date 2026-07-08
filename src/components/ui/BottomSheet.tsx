import { type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

// ─── Bottom Sheet ──────────────────────────────────────────────────────────

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  snapPoints?: ('half' | 'full')
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative w-full bg-[var(--bg)] rounded-t-3xl border-t border-[var(--border)]',
              'shadow-[var(--shadow-lg)] max-h-[92dvh] overflow-y-auto',
              'pb-[env(safe-area-inset-bottom,0px)]',
              className
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={16} />
                </Button>
              </div>
            )}

            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Drawer ────────────────────────────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  side?: 'left' | 'right'
  className?: string
}

export function Drawer({ isOpen, onClose, title, children, side = 'left', className }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const slideFrom = side === 'left' ? { x: '-100%' } : { x: '100%' }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn('fixed inset-0 z-50 flex', side === 'right' && 'justify-end')}>
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative h-full bg-[var(--bg)] border-[var(--border)] overflow-y-auto w-72',
              side === 'left' ? 'border-r rounded-r-2xl' : 'border-l rounded-l-2xl',
              className
            )}
            initial={slideFrom}
            animate={{ x: 0 }}
            exit={slideFrom}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={16} />
                </Button>
              </div>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

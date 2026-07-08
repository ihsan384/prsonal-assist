import { type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FABProps {
  onClick: () => void
  label?: string
  extended?: boolean
  icon?: ReactNode
  className?: string
}

export function FAB({ onClick, label, extended = false, icon, className }: FABProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 bg-[var(--accent)] text-white shadow-[var(--shadow-lg)]',
          'hover:bg-[var(--accent-hover)] active:scale-95 transition-all duration-100',
          extended ? 'h-11 px-4 rounded-[10px] text-sm font-medium' : 'h-12 w-12 rounded-full',
          className
        )}
      >
        <span className="flex-shrink-0">{icon ?? <Plus size={18} />}</span>
        {extended && label && <span>{label}</span>}
      </button>
    </div>
  )
}

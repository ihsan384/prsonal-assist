import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, CheckSquare, Repeat2, Dumbbell,
  Utensils, Moon, Target, Library, Wallet, BarChart2,
  Settings, User, X, BookMarked, Flame,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/study', icon: BookOpen, label: 'Study ERP' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/habits', icon: Repeat2, label: 'Habits' },
  { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
  { path: '/sleep', icon: Moon, label: 'Sleep' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/knowledge', icon: Library, label: 'Knowledge' },
  { path: '/finance', icon: Wallet, label: 'Finance' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/reflection', icon: BookMarked, label: 'Daily Reflection' },
  { path: '/motivation', icon: Flame, label: 'Motivation Center' },
]

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/profile', icon: User, label: 'Profile' },
]

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.aside
            className="absolute top-0 left-0 bottom-0 w-72 bg-[var(--bg)] border-r border-[var(--border)] flex flex-col h-full shadow-lg pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="px-4 h-14 flex items-center justify-between border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">I</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)] leading-none">Ihsan OS</p>
                  <p className="text-[10px] text-[var(--text-4)] mt-0.5">Personal OS</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[8px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-1">
              {navItems.map(item => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 h-12 rounded-[8px] text-sm font-medium transition-all duration-100 relative overflow-hidden',
                      active
                        ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-semibold border-l-4 border-[var(--accent)] rounded-l-none'
                        : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                    )}
                  >
                    <item.icon size={16} className={active ? 'text-[var(--accent)]' : ''} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Bottom Links */}
            <div className="p-2 border-t border-[var(--border)] space-y-1">
              {bottomItems.map(item => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 h-12 rounded-[8px] text-sm font-medium transition-all duration-100 relative overflow-hidden',
                      active
                        ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-semibold border-l-4 border-[var(--accent)] rounded-l-none'
                        : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                    )}
                  >
                    <item.icon size={16} className={active ? 'text-[var(--accent)]' : ''} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

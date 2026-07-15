import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, CheckSquare, Repeat2, Dumbbell,
  Utensils, Moon, Target, Library, Wallet, BarChart2,
  Settings, User, BookMarked, Flame,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/habits', icon: Repeat2, label: 'Habits' },
  { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
  { path: '/sleep', icon: Moon, label: 'Sleep' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/knowledge', icon: Library, label: 'Knowledge' },
  { path: '/finance', icon: Wallet, label: 'Finance' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/reflection', icon: BookMarked, label: 'Reflection' },
  { path: '/motivation', icon: Flame, label: 'Motivation' },
]

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-[var(--bg)] border-r border-[var(--border)] h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text)] leading-none">Ihsan OS</p>
            <p className="text-[10px] text-[var(--text-4)] mt-0.5">Personal OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium transition-all duration-100 mb-0.5',
                active
                  ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
                  : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
              )}
            >
              <item.icon size={15} className={active ? 'text-[var(--accent)]' : ''} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-[var(--border)]">
        {bottomItems.map(item => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium transition-all duration-100 mb-0.5',
                active
                  ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
                  : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
              )}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

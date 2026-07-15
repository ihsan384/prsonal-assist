import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, CheckSquare, Repeat2, Dumbbell,
  Utensils, Moon, Target, Library, Wallet, BarChart2, BookMarked, Flame,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const tabs = [
  { path: '/',          icon: LayoutDashboard, label: 'Home' },
  { path: '/study',     icon: BookOpen,         label: 'Study' },
  { path: '/tasks',     icon: CheckSquare,      label: 'Tasks' },
  { path: '/habits',    icon: Repeat2,          label: 'Habits' },
  { path: '/fitness',   icon: Dumbbell,         label: 'Fitness' },
  { path: '/nutrition', icon: Utensils,         label: 'Nutrition' },
  { path: '/sleep',     icon: Moon,             label: 'Sleep' },
  { path: '/goals',     icon: Target,           label: 'Goals' },
  { path: '/knowledge', icon: Library,          label: 'Know' },
  { path: '/finance',   icon: Wallet,           label: 'Finance' },
  { path: '/analytics', icon: BarChart2,        label: 'Stats' },
  { path: '/reflection',icon: BookMarked,       label: 'Journal' },
  { path: '/motivation',icon: Flame,            label: 'Motivate' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe">
      <div className="flex items-stretch h-14 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[56px] flex-1 px-1 transition-all duration-100',
                active ? 'text-[var(--accent)]' : 'text-[var(--text-4)]'
              )}
            >
              <tab.icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              <span className={cn('text-[9px] font-medium leading-tight', active ? 'text-[var(--accent)]' : 'text-[var(--text-4)]')}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

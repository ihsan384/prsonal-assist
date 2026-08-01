import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, CheckSquare, Repeat2, Dumbbell,
  Utensils, Moon, Target, Library, Wallet, BarChart2,
  Settings, User, BookMarked, Flame, LogOut, Music, Sparkles
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/habits', icon: Repeat2, label: 'Habits' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
  { path: '/sleep', icon: Moon, label: 'Sleep' },
  { path: '/knowledge', icon: Library, label: 'Knowledge' },
  { path: '/finance', icon: Wallet, label: 'Finance' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/reflection', icon: BookMarked, label: 'Reflection' },
  { path: '/motivation', icon: Flame, label: 'Motivation' },
  { path: '/music', icon: Music, label: 'Spotify Music' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, profile, user, logout } = useAuth()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const userEmail = user?.email || 'student@studyerp.app'

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-[var(--bg)] border-r border-[var(--border)] h-screen sticky top-0 shrink-0 select-none">
      {/* Logo Header */}
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text)] tracking-tight leading-none">Study ERP</h1>
            <p className="text-[10px] text-[var(--text-3)] font-medium mt-1">Study Management</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary-500/10 text-primary-500 font-semibold'
                  : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
              )}
            >
              <item.icon size={16} className={active ? 'text-primary-500' : 'text-[var(--text-3)]'} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom Area */}
      <div className="p-2 border-t border-[var(--border)] space-y-1 bg-[var(--card-bg)]">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
            isActive('/settings')
              ? 'bg-primary-500/10 text-primary-500 font-semibold'
              : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
          )}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>

        {isAuthenticated && (
          <div className="pt-2 border-t border-[var(--border)] mt-1">
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer transition-colors group"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="User Avatar" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-xs shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text)] truncate leading-tight group-hover:text-primary-500">
                  {displayName}
                </p>
                <p className="text-[10px] text-[var(--text-3)] truncate leading-tight mt-0.5">
                  {userEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  logout()
                }}
                title="Sign Out"
                className="p-1 rounded-lg text-[var(--text-4)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

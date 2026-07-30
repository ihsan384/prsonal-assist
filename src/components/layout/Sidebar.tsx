import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, CheckSquare, Repeat2, Dumbbell,
  Utensils, Moon, Target, Library, Wallet, BarChart2,
  Settings, User, BookMarked, Flame, Shield, LogIn, Users, Briefcase, FolderKanban, Music
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'

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
  { path: '/music', icon: Music, label: 'Spotify Music' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, role, profile, osName } = useAuth()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-[var(--bg)] border-r border-[var(--border)] h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-tr from-primary-600 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{osName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text)] leading-none">{osName}</p>
            <p className="text-[10px] text-[var(--text-4)] mt-0.5">
              {isAuthenticated ? `Role: ${role.toUpperCase()}` : 'Personal ERP'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {/* Role Portal Shortcuts if Authenticated */}
        {isAuthenticated && (role === 'owner' || role === 'admin') && (
          <div className="mb-2 pb-2 border-b border-[var(--border)]">
            <button
              onClick={() => navigate('/admin/users')}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-semibold transition-all duration-100',
                isActive('/admin/users')
                  ? 'bg-purple-500/10 text-purple-600'
                  : 'text-purple-500 hover:bg-purple-500/10'
              )}
            >
              <Users size={16} /> User Management
            </button>
          </div>
        )}

        {isAuthenticated && role === 'employee' && (
          <div className="mb-2 pb-2 border-b border-[var(--border)]">
            <button
              onClick={() => navigate('/workspace')}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-semibold transition-all duration-100',
                isActive('/workspace')
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'text-amber-500 hover:bg-amber-500/10'
              )}
            >
              <Briefcase size={16} /> Workspace
            </button>
          </div>
        )}

        {isAuthenticated && role === 'client' && (
          <div className="mb-2 pb-2 border-b border-[var(--border)]">
            <button
              onClick={() => navigate('/client')}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-semibold transition-all duration-100',
                isActive('/client')
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'text-emerald-500 hover:bg-emerald-500/10'
              )}
            >
              <FolderKanban size={16} /> Client Portal
            </button>
          </div>
        )}

        {navItems.map((item) => {
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
      <div className="px-2 py-3 border-t border-[var(--border)] space-y-1">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium transition-all duration-100',
            isActive('/settings')
              ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
              : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
          )}
        >
          <Settings size={15} />
          Settings
        </button>

        {isAuthenticated ? (
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium transition-all duration-100',
              isActive('/profile')
                ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
                : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
            )}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <User size={15} />
            )}
            Profile
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-semibold bg-primary-500/10 text-primary-600 hover:bg-primary-500/20 transition-colors"
          >
            <LogIn size={15} />
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  )
}

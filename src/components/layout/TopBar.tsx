import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '../ui/Button'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/study': 'Study ERP',
  '/tasks': 'Tasks',
  '/habits': 'Habits',
  '/fitness': 'Fitness',
  '/nutrition': 'Nutrition',
  '/sleep': 'Sleep',
  '/goals': 'Goals',
  '/knowledge': 'Knowledge Library',
  '/finance': 'Finance',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

interface TopBarProps {
  onMenuClick?: () => void
  rightContent?: ReactNode
  className?: string
}

export function TopBar({ onMenuClick, rightContent, className }: TopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Match path prefix, e.g. /study/subjects or /study
  let title = 'Ihsan OS'
  const path = location.pathname
  if (path.startsWith('/study')) {
    title = 'Study ERP'
  } else {
    title = PAGE_TITLES[path] ?? 'Ihsan OS'
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center justify-between h-14 px-4 shrink-0',
        'bg-[var(--bg)] border-b border-[var(--border)]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger Menu button on mobile */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-[var(--text-2)]"
            title="Open Menu"
          >
            <Menu size={18} />
          </Button>
        )}
        <h1 className="text-sm font-semibold text-[var(--text)] tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {rightContent}
        
        {/* Search Placeholder Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-[var(--text-3)]"
          title="Search"
          onClick={() => navigate('/tasks')}
        >
          <Search size={15} />
        </Button>

        {/* Profile Avatar Placeholder Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-[var(--text-3)] rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-center overflow-hidden"
          title="Profile"
          onClick={() => navigate('/profile')}
        >
          <User size={13} className="text-[var(--text-2)]" />
        </Button>
      </div>
    </header>
  )
}

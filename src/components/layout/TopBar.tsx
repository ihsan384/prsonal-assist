import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '../ui/Button'
import { useTheme } from '@/contexts/ThemeContext'

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
  rightContent?: ReactNode
  className?: string
}

export function TopBar({ rightContent, className }: TopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  
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
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-[var(--text)]">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {rightContent}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          className="text-[var(--text-3)]"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </Button>
        <Button variant="ghost" size="icon-sm" className="text-[var(--text-3)]" onClick={() => navigate('/settings')}>
          <SettingsIcon />
        </Button>
      </div>
    </header>
  )
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 10C8.88071 10 10 8.88071 10 7.5C10 6.11929 8.88071 5 7.5 5C6.11929 5 5 6.11929 5 7.5C5 8.88071 6.11929 10 7.5 10Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 7.5C12.5 7.15 12.18 6.84 11.9 6.7C11.77 6.64 11.66 6.54 11.6 6.42C11.45 6.12 11.25 5.85 11.02 5.6C10.93 5.5 10.91 5.36 10.96 5.23C11.09 4.88 11.23 4.5 10.97 4.24C10.71 3.98 10.33 4.12 9.98 4.25C9.85 4.3 9.71 4.28 9.61 4.19C9.36 3.96 9.09 3.76 8.79 3.61C8.67 3.55 8.57 3.44 8.51 3.31C8.37 3.03 8.06 2.71 7.71 2.71C7.36 2.71 7.05 3.03 6.91 3.31C6.85 3.44 6.75 3.55 6.63 3.61C6.33 3.76 6.06 3.96 5.81 4.19C5.71 4.28 5.57 4.3 5.44 4.25C5.09 4.12 4.71 3.98 4.45 4.24C4.19 4.5 4.33 4.88 4.46 5.23C4.51 5.36 4.49 5.5 4.4 5.6C4.17 5.85 3.97 6.12 3.82 6.42C3.76 6.54 3.65 6.64 3.52 6.7C3.24 6.84 2.92 7.15 2.92 7.5C2.92 7.85 3.24 8.16 3.52 8.3C3.65 8.36 3.76 8.46 3.82 8.58C3.97 8.88 4.17 9.15 4.4 9.4C4.49 9.5 4.51 9.64 4.46 9.77C4.33 10.12 4.19 10.5 4.45 10.76C4.71 11.02 5.09 10.88 5.44 10.75C5.57 10.7 5.71 10.72 5.81 10.81C6.06 11.04 6.33 11.24 6.63 11.39C6.75 11.45 6.85 11.56 6.91 11.69C7.05 11.97 7.36 12.29 7.71 12.29C8.06 12.29 8.37 11.97 8.51 11.69C8.57 11.56 8.67 11.45 8.79 11.39C9.09 11.24 9.36 11.04 9.61 10.81C9.71 10.72 9.85 10.7 9.98 10.75C10.33 10.88 10.71 11.02 10.97 10.76C11.23 10.5 11.09 10.12 10.96 9.77C10.91 9.64 10.93 9.5 11.02 9.4C11.25 9.15 11.45 8.88 11.6 8.58C11.66 8.46 11.77 8.36 11.9 8.3C12.18 8.16 12.5 7.85 12.5 7.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

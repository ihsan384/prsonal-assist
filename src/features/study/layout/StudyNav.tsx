import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

const LINKS = [
  { path: '/study', label: 'Overview', exact: true },
  { path: '/study/pomodoro', label: 'Pomodoro' },
  { path: '/study/subjects', label: 'Subjects' },
  { path: '/study/sessions', label: 'Sessions' },
  { path: '/study/revision', label: 'Revision' },
  { path: '/study/questions', label: 'Practice' },
  { path: '/study/tests', label: 'Mock Tests' },
  { path: '/study/mistakes', label: 'Mistakes' },
  { path: '/study/formulas', label: 'Formulas' },
  { path: '/study/notes', label: 'Notes' },
  { path: '/study/calendar', label: 'Calendar' },
  { path: '/study/stats', label: 'Stats' }
]

export function StudyNav() {
  return (
    <div className="w-full border-b border-[var(--border)] bg-[var(--bg-subtle)] shrink-0 overflow-x-auto no-scrollbar">
      <div className="max-w-5xl mx-auto px-4 flex gap-4 h-11 items-stretch">
        {LINKS.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) => cn(
              'flex items-center text-xs font-semibold px-1 border-b-2 transition-all whitespace-nowrap cursor-pointer',
              isActive 
                ? 'border-[var(--accent)] text-[var(--accent)]' 
                : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
            )}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

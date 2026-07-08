import { Outlet } from 'react-router-dom'
import { StudyNav } from './StudyNav'

export function StudyLayout() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg)]">
      {/* Sub nav subheader */}
      <StudyNav />

      {/* Pages Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  )
}

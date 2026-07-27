import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Briefcase, CheckSquare, FolderGit2, LogOut, Clock, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function WorkspacePage() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <PageWrapper title="Employee Workspace" subtitle="Assigned Operations & Workspace Tools">
      {/* Header Info */}
      <Card className="mb-6 p-6 border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-lg">
            {(profile?.full_name || 'E').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{profile?.full_name || 'Employee Workspace'}</h2>
            <p className="text-xs text-[var(--text-3)]">Role: EMPLOYEE | {profile?.email}</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="gap-2 text-xs">
          <LogOut size={14} /> Sign Out
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card onClick={() => navigate('/tasks')} className="p-6 cursor-pointer hover:border-primary-500/40 transition-all">
          <div className="p-3 rounded-xl bg-primary-500/10 text-primary-500 w-fit mb-3">
            <CheckSquare size={24} />
          </div>
          <h3 className="font-bold text-lg text-[var(--text)] mb-1">Assigned Tasks</h3>
          <p className="text-xs text-[var(--text-3)]">View and complete tasks assigned to your employee account.</p>
        </Card>

        <Card onClick={() => navigate('/study')} className="p-6 cursor-pointer hover:border-blue-500/40 transition-all">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 w-fit mb-3">
            <FolderGit2 size={24} />
          </div>
          <h3 className="font-bold text-lg text-[var(--text)] mb-1">Knowledge & Projects</h3>
          <p className="text-xs text-[var(--text-3)]">Access internal documentation, projects, and learning resources.</p>
        </Card>

        <Card onClick={() => navigate('/fitness')} className="p-6 cursor-pointer hover:border-amber-500/40 transition-all">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 w-fit mb-3">
            <Briefcase size={24} />
          </div>
          <h3 className="font-bold text-lg text-[var(--text)] mb-1">Operations Hub</h3>
          <p className="text-xs text-[var(--text-3)]">Manage assigned client modules and operational workflows.</p>
        </Card>
      </div>
    </PageWrapper>
  )
}

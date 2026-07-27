import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { FolderKanban, FileText, CreditCard, LogOut, Dumbbell, Utensils, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ClientPortalPage() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <PageWrapper>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Client Portal</h1>
        <p className="text-sm text-[var(--text-3)]">Access your projects, files, invoices, and shared resources</p>
      </div>

      {/* Header Info */}
      <Card className="mb-6 p-6 border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Client Avatar'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xl">
              {(profile?.full_name || profile?.email || 'C').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{profile?.full_name || 'Client User'}</h2>
            <p className="text-xs text-[var(--text-3)]">Role: CLIENT | {profile?.email}</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="gap-2 text-xs">
          <LogOut size={14} /> Sign Out
        </Button>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card onClick={() => navigate('/goals')} className="p-5 cursor-pointer hover:border-emerald-500/40 transition-all">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-3">
            <FolderKanban size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">My Projects</h4>
          <p className="text-xs text-[var(--text-3)]">View status and milestones of your active projects.</p>
        </Card>

        <Card onClick={() => navigate('/knowledge')} className="p-5 cursor-pointer hover:border-blue-500/40 transition-all">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 w-fit mb-3">
            <FileText size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">Shared Files</h4>
          <p className="text-xs text-[var(--text-3)]">Access documents, attachments, and resources.</p>
        </Card>

        <Card onClick={() => navigate('/finance')} className="p-5 cursor-pointer hover:border-purple-500/40 transition-all">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-3">
            <CreditCard size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">Invoices & Payments</h4>
          <p className="text-xs text-[var(--text-3)]">Review payment receipts and active subscriptions.</p>
        </Card>

        <Card onClick={() => navigate('/fitness')} className="p-5 cursor-pointer hover:border-amber-500/40 transition-all">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 w-fit mb-3">
            <Dumbbell size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">Personal Fitness</h4>
          <p className="text-xs text-[var(--text-3)]">Access personal workout & nutrition logs.</p>
        </Card>
      </div>
    </PageWrapper>
  )
}

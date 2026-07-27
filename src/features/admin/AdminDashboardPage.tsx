import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Users, Dumbbell, Wallet, BarChart3, Settings, LogOut, ArrowRight, UserPlus } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()

  return (
    <PageWrapper>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Admin Control Center</h1>
        <p className="text-sm text-[var(--text-3)]">Comprehensive management for Gym ERP</p>
      </div>

      {/* Welcome Banner */}
      <Card className="mb-6 p-6 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-[var(--card-bg)] border border-purple-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Admin'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/30 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 font-black text-2xl flex items-center justify-center border border-purple-500/30">
                {(profile?.full_name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text)]">{profile?.full_name || 'System Administrator'}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-sm text-[var(--text-3)]">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/admin/users')} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Users size={18} /> Manage Users
            </Button>
            <Button onClick={logout} variant="outline" className="gap-2 border-purple-500/20 text-[var(--text-2)] hover:text-red-400">
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Admin Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          onClick={() => navigate('/admin/users')}
          className="p-6 cursor-pointer hover:border-purple-500/40 transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <ArrowRight size={20} className="text-[var(--text-3)] group-hover:text-purple-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">User Management</h3>
          <p className="text-xs text-[var(--text-3)]">
            Manage authenticated users, roles (owner, admin, employee, client), and profile information.
          </p>
        </Card>

        <Card
          onClick={() => navigate('/reception')}
          className="p-6 cursor-pointer hover:border-blue-500/40 transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <UserPlus size={24} />
            </div>
            <ArrowRight size={20} className="text-[var(--text-3)] group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">Reception & Members</h3>
          <p className="text-xs text-[var(--text-3)]">
            Access reception portal for member check-in, registration, and attendance logging.
          </p>
        </Card>

        <Card
          onClick={() => navigate('/trainer')}
          className="p-6 cursor-pointer hover:border-amber-500/40 transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Dumbbell size={24} />
            </div>
            <ArrowRight size={20} className="text-[var(--text-3)] group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">Trainer Workouts & Diets</h3>
          <p className="text-xs text-[var(--text-3)]">
            Review and create training programs, workout routines, and diet plans.
          </p>
        </Card>
      </div>
    </PageWrapper>
  )
}

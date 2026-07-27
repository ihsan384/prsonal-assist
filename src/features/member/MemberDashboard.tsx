import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Dumbbell, Utensils, CalendarCheck, CreditCard, ShieldCheck,
  LogOut, AlertCircle, Sparkles, CheckCircle2
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'

export default function MemberDashboard() {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()

  return (
    <PageWrapper>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Member Portal</h1>
        <p className="text-sm text-[var(--text-3)]">Your gym membership, workout routines, and attendance</p>
      </div>

      {/* Profile Overview Card */}
      <Card className="mb-8 p-6 bg-gradient-to-r from-emerald-950/30 via-teal-950/20 to-[var(--card-bg)] border border-emerald-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Member Avatar'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-3xl flex items-center justify-center border border-emerald-500/40 shadow-lg">
                {(profile?.full_name || profile?.email || 'M').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">
                  {profile?.full_name || 'Gym Member'}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  {profile?.role || 'Member'}
                </span>
              </div>
              <p className="text-sm text-[var(--text-2)] mt-0.5">{profile?.email}</p>
              {profile?.phone && (
                <p className="text-xs text-[var(--text-3)] mt-1">Phone: {profile.phone}</p>
              )}
            </div>
          </div>

          <Button onClick={logout} variant="outline" className="gap-2 border-emerald-500/20 text-[var(--text-2)] hover:text-red-400">
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </Card>

      {/* Account Status */}
      <Card className="mb-8 p-6 border-emerald-500/20 bg-emerald-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">Active Personal ERP Profile</h3>
              <p className="text-xs text-[var(--text-2)]">
                Email: <strong className="text-[var(--text)]">{profile?.email}</strong> | Role:{' '}
                <strong className="text-[var(--text)]">{profile?.role?.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Access Cards */}
      <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
        <Sparkles className="text-primary-500" size={20} /> Member Access Hub
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          onClick={() => navigate('/fitness')}
          className="p-5 cursor-pointer hover:border-primary-500/40 transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-primary-500/10 text-primary-500 w-fit mb-3 group-hover:bg-primary-500 group-hover:text-white transition-colors">
            <Dumbbell size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">Workout Plans</h4>
          <p className="text-xs text-[var(--text-3)]">View your assigned training exercises & workout logs.</p>
        </Card>

        <Card
          onClick={() => navigate('/nutrition')}
          className="p-5 cursor-pointer hover:border-emerald-500/40 transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <Utensils size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">Diet Plans</h4>
          <p className="text-xs text-[var(--text-3)]">Access meal schedules and nutrition goals.</p>
        </Card>

        <Card
          onClick={() => navigate('/finance')}
          className="p-5 cursor-pointer hover:border-blue-500/40 transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 w-fit mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <CreditCard size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">Payments & Fees</h4>
          <p className="text-xs text-[var(--text-3)]">Check invoice receipts and membership payments.</p>
        </Card>

        <Card
          onClick={() => navigate('/profile')}
          className="p-5 cursor-pointer hover:border-purple-500/40 transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <CalendarCheck size={24} />
          </div>
          <h4 className="font-bold text-[var(--text)] text-base mb-1">Attendance & Profile</h4>
          <p className="text-xs text-[var(--text-3)]">View overall gym visit history and settings.</p>
        </Card>
      </div>
    </PageWrapper>
  )
}

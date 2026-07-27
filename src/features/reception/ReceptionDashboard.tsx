import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Users, CheckCircle, Search, Calendar, UserCheck, LogOut } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth/authService'
import { useToast } from '@/contexts/ToastContext'
import type { GymMember } from '@/types/auth.types'

export default function ReceptionDashboard() {
  const { profile, logout } = useAuth()
  const toast = useToast()
  const [members, setMembers] = useState<GymMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    authService.getAllMembers()
      .then(setMembers)
      .catch((err) => console.error('Failed to load members:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleCheckIn = (member: GymMember) => {
    setCheckedInIds((prev) => new Set(prev).add(member.id))
    toast.success(`Check-in recorded for ${member.full_name}`)
  }

  const filtered = members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper title="Reception Desk" subtitle="Member Check-In, Attendance & Registration">
      {/* Header Info */}
      <Card className="mb-6 p-6 border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 font-bold flex items-center justify-center text-lg">
            {(profile?.full_name || 'R').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{profile?.full_name || 'Reception Staff'}</h2>
            <p className="text-xs text-[var(--text-3)]">Role: RECEPTIONIST</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="gap-2 text-xs">
          <LogOut size={14} /> Sign Out
        </Button>
      </Card>

      {/* Check In Search */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" size={18} />
        <Input
          placeholder="Search member by name to log attendance..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members Attendance List */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-[var(--bg-2)] border-b border-[var(--border)] font-bold text-sm text-[var(--text)] flex items-center justify-between">
          <span>Gym Members ({members.length})</span>
          <span className="text-xs text-[var(--text-3)]">Today's Check-ins: {checkedInIds.size}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-3)] text-sm">No members found.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((m) => {
              const isCheckedIn = checkedInIds.has(m.id)
              return (
                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-2)]/50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-[var(--text)]">{m.full_name}</p>
                    <p className="text-xs text-[var(--text-3)]">
                      Type: {m.membership_type} | Status: <span className="text-emerald-500 font-semibold">{m.membership_status}</span>
                    </p>
                  </div>

                  <Button
                    size="sm"
                    disabled={isCheckedIn}
                    onClick={() => handleCheckIn(m)}
                    className={isCheckedIn ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'gap-1'}
                  >
                    {isCheckedIn ? <CheckCircle size={14} /> : <UserCheck size={14} />}
                    <span>{isCheckedIn ? 'Checked In' : 'Log Attendance'}</span>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </PageWrapper>
  )
}

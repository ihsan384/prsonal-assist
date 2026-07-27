import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Search, Filter, Shield, UserCheck, UserX,
  Trash2, Mail, Phone, Calendar, RefreshCw, Loader2, CheckCircle2, XCircle
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/auth/authService'
import { useToast } from '@/contexts/ToastContext'
import type { UserProfile, UserRole } from '@/types/auth.types'

export default function UserManagementPage() {
  const toast = useToast()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const profilesData = await authService.getAllProfiles()
      setProfiles(profilesData)
    } catch (err: any) {
      console.error('Failed to load user management data:', err)
      toast.error('Failed to load users: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter profiles based on search query & role filter
  const filteredProfiles = profiles.filter((p) => {
    const matchSearch =
      (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchRole = roleFilter === 'all' || p.role === roleFilter
    return matchSearch && matchRole
  })

  // Handle Role Change
  const handleRoleChange = async (profileId: string, newRole: UserRole) => {
    setActionLoading(true)
    try {
      await authService.updateUserRole(profileId, newRole)
      toast.success(`User role updated to ${newRole}`)
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      )
    } catch (err: any) {
      toast.error('Failed to update role: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Disable / Enable Toggle
  const handleToggleDisable = async (profileId: string, currentStatus: boolean) => {
    setActionLoading(true)
    try {
      await authService.toggleUserDisabled(profileId, !currentStatus)
      toast.success(currentStatus ? 'User account re-activated' : 'User account disabled')
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, is_disabled: !currentStatus } : p))
      )
    } catch (err: any) {
      toast.error('Failed to update user status: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete Profile
  const handleDeleteProfile = async (profileId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete profile for "${name}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading(true)
    try {
      await authService.deleteProfile(profileId)
      toast.success(`Profile for ${name} deleted successfully`)
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    } catch (err: any) {
      toast.error('Failed to delete profile: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const roleBadgeColors: Record<UserRole, string> = {
    owner: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    employee: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    client: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  }

  return (
    <PageWrapper
      title="User Management"
      subtitle="Manage authenticated users, assign roles (owner, admin, employee, client), and soft-disable accounts"
    >
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" size={18} />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--text-3)] shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 bg-[var(--bg-2)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>

        <Button onClick={loadData} variant="outline" className="gap-2 shrink-0">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden p-0 border border-[var(--border)]">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-3)] flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary-500" size={32} />
            <p>Loading user profiles...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-3)]">
            <Users size={40} className="mx-auto mb-2 opacity-40" />
            <p className="font-semibold">No users found</p>
            <p className="text-xs text-[var(--text-3)]">Try clearing filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--bg-2)] border-b border-[var(--border)] text-[var(--text-2)] font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">User Info</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProfiles.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-2)]/50 transition-colors">
                    {/* User Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || 'User Avatar'}
                            className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center font-bold">
                            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[var(--text)]">{user.full_name || 'Anonymous User'}</p>
                          <p className="text-xs text-[var(--text-3)] flex items-center gap-1">
                            <Mail size={12} /> {user.email || 'No Email'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={actionLoading}
                        className={`h-8 px-2 rounded-lg text-xs font-bold border transition-colors ${roleBadgeColors[user.role]}`}
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                        <option value="client">Client</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {user.is_disabled ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                          <XCircle size={12} /> Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleDisable(user.id, user.is_disabled)}
                          disabled={actionLoading}
                          title={user.is_disabled ? 'Enable Account' : 'Soft Disable Account'}
                          className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                            user.is_disabled
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                          }`}
                        >
                          {user.is_disabled ? <UserCheck size={16} /> : <UserX size={16} />}
                        </button>

                        <button
                          onClick={() => handleDeleteProfile(user.id, user.full_name || 'User')}
                          disabled={actionLoading}
                          title="Delete User Profile"
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageWrapper>
  )
}

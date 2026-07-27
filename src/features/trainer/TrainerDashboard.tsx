import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Utensils, Users, Plus, Check, LogOut } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export default function TrainerDashboard() {
  const { profile, logout } = useAuth()

  return (
    <PageWrapper title="Trainer Portal" subtitle="Workout Plans & Diet Program Management">
      {/* Header Info */}
      <Card className="mb-6 p-6 border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-lg">
            {(profile?.full_name || 'T').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{profile?.full_name || 'Personal Trainer'}</h2>
            <p className="text-xs text-[var(--text-3)]">Role: TRAINER</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="gap-2 text-xs">
          <LogOut size={14} /> Sign Out
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Dumbbell size={24} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text)]">Workout Plans</h3>
            </div>
            <Button size="sm" className="gap-1">
              <Plus size={14} /> New Routine
            </Button>
          </div>
          <p className="text-xs text-[var(--text-3)]">
            Create customized strength, cardio, and hypertrophy workout programs for gym members.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Utensils size={24} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text)]">Diet & Nutrition</h3>
            </div>
            <Button size="sm" className="gap-1">
              <Plus size={14} /> New Diet Plan
            </Button>
          </div>
          <p className="text-xs text-[var(--text-3)]">
            Assign macro goals, meal schedules, and nutritional guidelines to assigned members.
          </p>
        </Card>
      </div>
    </PageWrapper>
  )
}

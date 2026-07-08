import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, Volume2, Vibrate, Clock, Calendar,
  Palette, Trash2, ChevronRight, Shield, Database, Info,
  BookOpen, Droplet, Moon, Flame
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'

interface ToggleProps {
  enabled: boolean
  onToggle: () => void
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    haptic: true,
    compactMode: false,
    weekStartMonday: true,
    time24h: false,
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const sections = [
    {
      title: 'Appearance',
      items: [
        { icon: Palette, label: 'Compact Mode', description: 'Reduce spacing', key: 'compactMode' as const },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: Bell, label: 'Notifications', description: 'Habit & task reminders', key: 'notifications' as const },
        { icon: Volume2, label: 'Sound', description: 'Sound effects & alerts', key: 'sound' as const },
        { icon: Vibrate, label: 'Haptic Feedback', description: 'Vibration on actions', key: 'haptic' as const },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Calendar, label: 'Week Starts Monday', description: 'Change first day of week', key: 'weekStartMonday' as const },
        { icon: Clock, label: '24-Hour Time', description: 'Use 24h time format', key: 'time24h' as const },
      ],
    },
  ]

  return (
    <PageWrapper>
      {/* App Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center text-white font-bold text-lg">
              I
            </div>
            <div>
              <p className="text-base font-bold text-[var(--text)]">Ihsan OS</p>
              <p className="text-xs text-[var(--text-3)]">Version 1.0.0 · Phase 1</p>
              <Badge variant="violet" size="sm" className="mt-1">Personal Build</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Toggle Settings */}
      {sections.map((section, si) => (
        <div key={section.title} className="mb-5">
          <SectionHeader title={section.title} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
          >
            <Card padding="none">
              <div className="divide-y divide-[var(--border)]">
                {section.items.map(item => (
                  <div key={item.key} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                      <item.icon size={16} className="text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)]">{item.label}</p>
                      <p className="text-xs text-[var(--text-3)]">{item.description}</p>
                    </div>
                    <Toggle enabled={settings[item.key]} onToggle={() => toggle(item.key)} />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      ))}

      {/* Goals */}
      <div className="mb-5">
        <SectionHeader title="Daily Goals" />
        <Card>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Study Goal', value: '6 hours', icon: BookOpen },
              { label: 'Water Goal', value: '3000 ml', icon: Droplet },
              { label: 'Sleep Goal', value: '8 hours', icon: Moon },
              { label: 'Calorie Goal', value: '2200 kcal', icon: Flame },
            ].map(goal => {
              const GoalIcon = goal.icon
              return (
                <div key={goal.label} className="flex items-center gap-3">
                  <GoalIcon size={18} className="text-[var(--text-3)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">{goal.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--accent)] font-semibold">{goal.value}</span>
                    <ChevronRight size={14} className="text-[var(--text-3)]" />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Data & Privacy */}
      <div className="mb-5">
        <SectionHeader title="Data & Privacy" />
        <Card padding="none">
          <div className="divide-y divide-[var(--border)]">
            {[
              { icon: Database, label: 'Export Data', description: 'Download all your data as JSON', action: () => {} },
              { icon: Shield, label: 'Privacy Policy', description: 'No data leaves your device', action: () => {} },
              { icon: Info, label: 'About', description: 'Built for Ihsan · Phase 1', action: () => {} },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-[var(--text-3)]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--text)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-3)]">{item.description}</p>
                </div>
                <ChevronRight size={14} className="text-[var(--text-3)]" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="mb-5">
        <SectionHeader title="Danger Zone" />
        <Card>
          <Button
            variant="destructive"
            fullWidth
            icon={<Trash2 size={16} />}
          >
            Clear All Data
          </Button>
          <p className="text-xs text-[var(--text-3)] text-center mt-2">This action cannot be undone</p>
        </Card>
      </div>
    </PageWrapper>
  )
}

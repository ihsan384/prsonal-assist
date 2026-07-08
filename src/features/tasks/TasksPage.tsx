import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, AlertCircle, Circle, CheckCircle2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchBar } from '@/components/ui/Input'
import { FAB } from '@/components/ui/FAB'

type TaskStatus = 'todo' | 'in_progress' | 'done'

interface TaskItem {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: TaskStatus
  dueTime?: string
  tags: string[]
}

const TASKS: TaskItem[] = [
  { id: '1', title: 'Complete Binary Trees Chapter', category: 'Study', priority: 'high', status: 'in_progress', dueTime: '3:00 PM', tags: ['DSA', 'Algorithms'] },
  { id: '2', title: 'Review pull requests on gym app', category: 'Work', priority: 'medium', status: 'todo', dueTime: '5:00 PM', tags: ['Code Review'] },
  { id: '3', title: 'Evening workout session', category: 'Fitness', priority: 'medium', status: 'todo', dueTime: '6:30 PM', tags: ['Health'] },
  { id: '4', title: "Plan tomorrow's schedule", category: 'Personal', priority: 'low', status: 'todo', tags: ['Planning'] },
  { id: '5', title: 'Read System Design book', category: 'Study', priority: 'medium', status: 'done', tags: ['Books'] },
  { id: '6', title: 'Morning run — 5km', category: 'Fitness', priority: 'high', status: 'done', tags: ['Cardio'] },
  { id: '7', title: 'Track daily expenses', category: 'Finance', priority: 'low', status: 'done', tags: ['Money'] },
]

const priorityConfig = {
  low: { variant: 'default' as const, label: 'Low' },
  medium: { variant: 'info' as const, label: 'Medium' },
  high: { variant: 'warning' as const, label: 'High' },
  urgent: { variant: 'error' as const, label: 'Urgent' },
}

const statusTabs = [
  { id: 'all', label: 'All', count: TASKS.length },
  { id: 'todo', label: 'To Do', count: TASKS.filter(t => t.status === 'todo').length },
  { id: 'in_progress', label: 'In Progress', count: TASKS.filter(t => t.status === 'in_progress').length },
  { id: 'done', label: 'Done', count: TASKS.filter(t => t.status === 'done').length },
]

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = TASKS.filter(task => {
    const matchesTab = activeTab === 'all' || task.status === activeTab
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const todo = filtered.filter(t => t.status === 'todo')
  const inProgress = filtered.filter(t => t.status === 'in_progress')
  const done = filtered.filter(t => t.status === 'done')

  return (
    <PageWrapper>
      {/* Search */}
      <SearchBar
        placeholder="Search tasks..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        className="mb-4"
      />

      {/* Status Tabs */}
      <div className="flex gap-1 bg-[#111118] rounded-xl p-1 mb-5 border border-[rgba(255,255,255,0.06)]">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              activeTab === tab.id ? 'bg-[#7c6aff] text-white' : 'text-[#55556a] hover:text-[#8888a0]'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-[rgba(255,255,255,0.06)]'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Total', value: TASKS.length, icon: CheckSquare, color: '#7c6aff' },
          { label: 'Pending', value: TASKS.filter(t => t.status !== 'done').length, icon: Clock, color: '#f59e0b' },
          { label: 'Done', value: TASKS.filter(t => t.status === 'done').length, icon: CheckCircle2, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.06)]">
            <stat.icon size={16} style={{ color: stat.color }} />
            <span className="text-lg font-bold text-[#f0f0f5]">{stat.value}</span>
            <span className="text-[10px] text-[#55556a]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="In Progress" subtitle={`${inProgress.length} active`} />
          <div className="flex flex-col gap-3">
            {inProgress.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* To Do */}
      {todo.length > 0 && activeTab !== 'done' && (
        <div className="mb-5">
          <SectionHeader title="To Do" subtitle={`${todo.length} tasks`} />
          <div className="flex flex-col gap-3">
            {todo.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && activeTab !== 'todo' && activeTab !== 'in_progress' && (
        <div className="mb-5">
          <SectionHeader title="Completed" subtitle={`${done.length} done`} />
          <div className="flex flex-col gap-3 opacity-70">
            {done.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        </div>
      )}

      <FAB onClick={() => {}} />
    </PageWrapper>
  )
}

function TaskCard({ task, index }: { task: TaskItem; index: number }) {
  const [checked, setChecked] = useState(task.status === 'done')
  const priority = priorityConfig[task.priority]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card hover className={checked ? 'opacity-60' : ''}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => setChecked(v => !v)}
            className="mt-0.5 flex-shrink-0 text-[#55556a] hover:text-[#7c6aff] transition-colors"
          >
            {checked ? <CheckCircle2 size={20} className="text-[#10b981]" /> : <Circle size={20} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-[#f0f0f5] ${checked ? 'line-through text-[#55556a]' : ''}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant="default" size="sm">{task.category}</Badge>
              <Badge variant={priority.variant} size="sm">{priority.label}</Badge>
              {task.dueTime && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#55556a]">
                  <Clock size={10} />
                  {task.dueTime}
                </span>
              )}
            </div>
          </div>
          {task.priority === 'urgent' && <AlertCircle size={16} className="text-[#f43f5e] flex-shrink-0 mt-0.5" />}
        </div>
      </Card>
    </motion.div>
  )
}

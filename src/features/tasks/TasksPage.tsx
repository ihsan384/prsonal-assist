import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, AlertCircle, Circle, CheckCircle2, Plus } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchBar, Input, Select } from '@/components/ui/Input'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

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

const DEFAULT_TASKS: TaskItem[] = [
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('ihsanos_tasks')
    return saved ? JSON.parse(saved) : DEFAULT_TASKS
  })

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Study')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [newDueTime, setNewDueTime] = useState('')
  const [newTags, setNewTags] = useState('')

  const persistTasks = (updated: TaskItem[]) => {
    setTasks(updated)
    localStorage.setItem('ihsanos_tasks', JSON.stringify(updated))
  }

  const toggleTaskStatus = (id: string) => {
    const updated = tasks.map(task => {
      if (task.id === id) {
        const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
        return { ...task, status: nextStatus }
      }
      return task
    })
    persistTasks(updated)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const task: TaskItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'todo',
      dueTime: newDueTime ? newDueTime : undefined,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }

    persistTasks([task, ...tasks])
    setIsModalOpen(false)

    // Reset Form
    setNewTitle('')
    setNewCategory('Study')
    setNewPriority('medium')
    setNewDueTime('')
    setNewTags('')
  }

  const filtered = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.status === activeTab
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const todo = filtered.filter(t => t.status === 'todo')
  const inProgress = filtered.filter(t => t.status === 'in_progress')
  const done = filtered.filter(t => t.status === 'done')

  const statusTabs = [
    { id: 'all', label: 'All', count: tasks.length },
    { id: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { id: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
    { id: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ]

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
      <div className="flex gap-1 bg-[var(--bg-subtle)] rounded-xl p-1 mb-5 border border-[var(--border)]">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--bg-hover)] text-[var(--text-3)]'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Total', value: tasks.length, icon: CheckSquare, color: 'var(--accent)' },
          { label: 'Pending', value: tasks.filter(t => t.status !== 'done').length, icon: Clock, color: '#f59e0b' },
          { label: 'Done', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'var(--success)' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm">
            <stat.icon size={16} style={{ color: stat.color }} />
            <span className="text-lg font-bold text-[var(--text)]">{stat.value}</span>
            <span className="text-[10px] text-[var(--text-3)] font-medium uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="In Progress" subtitle={`${inProgress.length} active`} />
          <div className="flex flex-col gap-3">
            {inProgress.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onToggleStatus={toggleTaskStatus} />
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
              <TaskCard key={task.id} task={task} index={i} onToggleStatus={toggleTaskStatus} />
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && activeTab !== 'todo' && activeTab !== 'in_progress' && (
        <div className="mb-5">
          <SectionHeader title="Completed" subtitle={`${done.length} done`} />
          <div className="flex flex-col gap-3 opacity-75">
            {done.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onToggleStatus={toggleTaskStatus} />
            ))}
          </div>
        </div>
      )}

      <FAB onClick={() => setIsModalOpen(true)} />

      {/* Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Task">
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          <Input
            label="Task Title"
            placeholder="e.g. Study Chemistry chapter 3"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              options={[
                { value: 'Study', label: 'Study' },
                { value: 'Work', label: 'Work' },
                { value: 'Fitness', label: 'Fitness' },
                { value: 'Personal', label: 'Personal' },
              ]}
            />
            <Select
              label="Priority"
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as any)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>
          <Input
            label="Due Time (Optional)"
            placeholder="e.g. 5:00 PM"
            value={newDueTime}
            onChange={e => setNewDueTime(e.target.value)}
          />
          <Input
            label="Tags (Comma separated)"
            placeholder="e.g. Organic, Revision"
            value={newTags}
            onChange={e => setNewTags(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

function TaskCard({ task, index, onToggleStatus }: { task: TaskItem; index: number; onToggleStatus: (id: string) => void }) {
  const priority = priorityConfig[task.priority]
  const isDone = task.status === 'done'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card hover className={isDone ? 'opacity-65' : ''}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleStatus(task.id)}
            className="mt-0.5 flex-shrink-0 text-[var(--text-3)] hover:text-[var(--accent)] transition-colors"
          >
            {isDone ? <CheckCircle2 size={20} className="text-[var(--success)]" /> : <Circle size={20} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-[var(--text)] ${isDone ? 'line-through text-[var(--text-3)]' : ''}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant="default" size="sm">{task.category}</Badge>
              <Badge variant={priority.variant} size="sm">{priority.label}</Badge>
              {task.dueTime && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-3)]">
                  <Clock size={10} />
                  {task.dueTime}
                </span>
              )}
            </div>
          </div>
          {task.priority === 'urgent' && <AlertCircle size={16} className="text-[var(--error)] flex-shrink-0 mt-0.5" />}
        </div>
      </Card>
    </motion.div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, AlertCircle, Circle, CheckCircle2, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchBar, Input, Select } from '@/components/ui/Input'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { taskStorage } from '@/services/storage'
import type { Task, Priority, TaskStatus, TaskCategory } from '@/types'

const priorityConfig = {
  low: { variant: 'default' as const, label: 'Low' },
  medium: { variant: 'info' as const, label: 'Medium' },
  high: { variant: 'warning' as const, label: 'High' },
  urgent: { variant: 'error' as const, label: 'Urgent' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() => taskStorage.getAll())
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Delete Confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  // Form states
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCategory>('study')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDueTime, setNewDueTime] = useState('')
  const [newTags, setNewTags] = useState('')

  const reloadTasks = () => {
    setTasks(taskStorage.getAll())
  }

  const toggleTaskStatus = (id: string) => {
    const current = tasks.find(t => t.id === id)
    if (!current) return
    const nextStatus: TaskStatus = current.status === 'done' ? 'todo' : 'done'
    taskStorage.update(id, { status: nextStatus })
    reloadTasks()
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    taskStorage.add({
      title: newTitle.trim(),
      status: 'todo',
      priority: newPriority,
      category: newCategory,
      dueDate: newDueTime ? newDueTime : undefined,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      subtasks: [],
    })
    
    reloadTasks()
    setIsModalOpen(false)

    // Reset Form
    setNewTitle('')
    setNewCategory('study')
    setNewPriority('medium')
    setNewDueTime('')
    setNewTags('')
  }

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      taskStorage.remove(taskToDelete)
      reloadTasks()
    }
    setIsDeleteOpen(false)
    setTaskToDelete(null)
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

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={24} />}
          title="No tasks yet"
          description="Create your first task to organize your daily schedule and study goals."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Create your first task
            </Button>
          }
        />
      ) : (
        <>
          {/* In Progress */}
          {inProgress.length > 0 && (
            <div className="mb-5">
              <SectionHeader title="In Progress" subtitle={`${inProgress.length} active`} />
              <div className="flex flex-col gap-3">
                {inProgress.map((task, i) => (
                  <TaskCard key={task.id} task={task} index={i} onToggleStatus={toggleTaskStatus} onDelete={handleDeleteClick} />
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
                  <TaskCard key={task.id} task={task} index={i} onToggleStatus={toggleTaskStatus} onDelete={handleDeleteClick} />
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
                  <TaskCard key={task.id} task={task} index={i} onToggleStatus={toggleTaskStatus} onDelete={handleDeleteClick} />
                ))}
              </div>
            </div>
          )}
        </>
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
              onChange={e => setNewCategory(e.target.value as TaskCategory)}
              options={[
                { value: 'study', label: 'Study' },
                { value: 'work', label: 'Work' },
                { value: 'health', label: 'Fitness' },
                { value: 'personal', label: 'Personal' },
                { value: 'finance', label: 'Finance' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Select
              label="Priority"
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as Priority)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>
          <Input
            label="Due Time / Date (Optional)"
            placeholder="e.g. 5:00 PM or Today"
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

      {/* Delete Task Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setTaskToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to permanently delete this task?"
      />
    </PageWrapper>
  )
}

function TaskCard({ 
  task, 
  index, 
  onToggleStatus, 
  onDelete 
}: { 
  task: Task
  index: number
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void 
}) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const isDone = task.status === 'done'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card hover className={isDone ? 'opacity-65' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggleStatus(task.id)}
              className="mt-0.5 flex-shrink-0 text-[var(--text-3)] hover:text-[var(--accent)] transition-colors"
            >
              {isDone ? <CheckCircle2 size={20} className="text-[var(--success)]" /> : <Circle size={20} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium text-[var(--text)] break-words ${isDone ? 'line-through text-[var(--text-3)]' : ''}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <Badge variant="default" size="sm" className="capitalize">{task.category}</Badge>
                <Badge variant={priority.variant} size="sm">{priority.label}</Badge>
                {task.dueDate && (
                  <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-3)]">
                    <Clock size={10} />
                    {task.dueDate}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            {task.priority === 'urgent' && <AlertCircle size={16} className="text-[var(--error)]" />}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
              className="text-[var(--text-4)] hover:text-[var(--error)] transition-colors p-1"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

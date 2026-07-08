import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Book, Link, Video, Headphones, Plus, Star } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchBar, Input, Select } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'

const typeIcons: Record<string, React.ComponentType<{ size: number }>> = {
  book: Book,
  article: Link,
  video: Video,
  course: Brain,
  podcast: Headphones,
  note: Brain,
}

interface KnowledgeItem {
  id: string
  title: string
  author: string
  type: string
  status: string
  rating: number
  tags: string[]
  progress?: number
  totalPages?: number
  currentPage?: number
  color: string
}

const DEFAULT_ITEMS: KnowledgeItem[] = [
  { id: '1', title: 'Clean Architecture', author: 'Robert C. Martin', type: 'book', status: 'reading', rating: 5, tags: ['Architecture', 'Design'], progress: 65, totalPages: 432, currentPage: 281, color: 'var(--accent)' },
  { id: '2', title: 'React Performance Patterns', author: 'Addy Osmani', type: 'article', status: 'completed', rating: 4, tags: ['React', 'Performance'], color: '#0284c7' },
  { id: '3', title: 'System Design Course', author: 'ByteByteGo', type: 'course', status: 'reading', rating: 5, tags: ['Backend', 'System Design'], progress: 45, color: '#16a34a' },
  { id: '4', title: 'The Pragmatic Programmer', author: 'Dave Thomas', type: 'book', status: 'want_to_read', rating: 0, tags: ['Programming', 'Career'], color: '#d97706' },
  { id: '5', title: 'Lex Fridman Podcast #391', author: 'Lex Fridman', type: 'podcast', status: 'completed', rating: 4, tags: ['AI', 'Tech'], color: '#ea580c' },
  { id: '6', title: 'Understanding TypeScript Generics', author: 'Matt Pocock', type: 'video', status: 'completed', rating: 5, tags: ['TypeScript'], color: '#7c3aed' },
]

const statusTabs = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading' },
  { id: 'completed', label: 'Done' },
  { id: 'want_to_read', label: 'Queue' },
]

const statusBadge: Record<string, { label: string; variant: 'violet' | 'success' | 'info' | 'default' }> = {
  reading: { label: 'Reading', variant: 'violet' },
  completed: { label: 'Done', variant: 'success' },
  want_to_read: { label: 'Queue', variant: 'info' },
  paused: { label: 'Paused', variant: 'default' },
}

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>(() => {
    const saved = localStorage.getItem('ihsanos_knowledge')
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS
  })

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [type, setType] = useState('book')
  const [status, setStatus] = useState('reading')
  const [rating, setRating] = useState('4')
  const [progress, setProgress] = useState('')
  const [currentPage, setCurrentPage] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [tags, setTags] = useState('')

  const persistItems = (updated: KnowledgeItem[]) => {
    setItems(updated)
    localStorage.setItem('ihsanos_knowledge', JSON.stringify(updated))
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const colorMap: Record<string, string> = {
      book: 'var(--accent)',
      article: '#0284c7',
      video: '#7c3aed',
      course: '#16a34a',
      podcast: '#ea580c',
      note: '#db2777',
    }

    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title: title.trim(),
      author: author.trim() || 'Unknown',
      type,
      status,
      rating: status === 'completed' ? Number(rating) : 0,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      progress: status === 'completed' ? 100 : progress ? Number(progress) : undefined,
      currentPage: currentPage ? Number(currentPage) : undefined,
      totalPages: totalPages ? Number(totalPages) : undefined,
      color: colorMap[type] || 'var(--accent)',
    }

    persistItems([...items, newItem])
    setIsModalOpen(false)

    // Reset Form
    setTitle('')
    setAuthor('')
    setType('book')
    setStatus('reading')
    setRating('4')
    setProgress('')
    setCurrentPage('')
    setTotalPages('')
    setTags('')
  }

  const filtered = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.status === activeTab
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <PageWrapper>
      <SearchBar
        placeholder="Search your library..."
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
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Total Items', value: items.length },
          { label: 'In Progress', value: items.filter(i => i.status === 'reading').length },
          { label: 'Completed', value: items.filter(i => i.status === 'completed').length },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm">
            <span className="text-lg font-bold text-[var(--text)]">{s.value}</span>
            <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-wider text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="mb-5">
        <SectionHeader title="Library" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setIsModalOpen(true)}>Add</Button>
        } />
        <div className="flex flex-col gap-3">
          {filtered.map((item, i) => {
            const Icon = typeIcons[item.type] ?? Brain
            const badge = statusBadge[item.status] || { label: 'Reading', variant: 'violet' }
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{item.title}</p>
                      <p className="text-xs text-[var(--text-3)] mt-0.5">{item.author}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                        {item.tags.slice(0, 2).map(t => (
                          <Badge key={t} variant="default" size="sm">{t}</Badge>
                        ))}
                      </div>
                      {item.progress !== undefined && (
                        <div className="mt-2">
                          <ProgressBar value={item.progress} color={item.color} height={3} />
                          <p className="text-[10px] text-[var(--text-3)] mt-0.5 font-medium">
                            {item.currentPage && `Page ${item.currentPage}/${item.totalPages} · `}{item.progress}%
                          </p>
                        </div>
                      )}
                    </div>
                    {item.rating > 0 && (
                      <div className="flex flex-shrink-0">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={10} className={j < item.rating ? 'text-[#d97706] fill-[#d97706]' : 'text-[var(--border-strong)]'} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      <FAB onClick={() => setIsModalOpen(true)} label="Add Entry" extended />

      {/* Add Knowledge Item Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Library">
        <form onSubmit={handleAddItem} className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="e.g. Designing Data-Intensive Applications"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Author / Source"
            placeholder="e.g. Martin Kleppmann"
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={e => setType(e.target.value)}
              options={[
                { value: 'book', label: 'Book' },
                { value: 'article', label: 'Article / Link' },
                { value: 'video', label: 'Video' },
                { value: 'course', label: 'Course' },
                { value: 'podcast', label: 'Podcast' },
                { value: 'note', label: 'Note' },
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              options={[
                { value: 'reading', label: 'Reading' },
                { value: 'completed', label: 'Completed' },
                { value: 'want_to_read', label: 'Want to Read (Queue)' },
              ]}
            />
          </div>
          {status === 'completed' ? (
            <Select
              label="Rating"
              value={rating}
              onChange={e => setRating(e.target.value)}
              options={[
                { value: '5', label: '5 Stars - Masterpiece' },
                { value: '4', label: '4 Stars - Very Good' },
                { value: '3', label: '3 Stars - Good' },
                { value: '2', label: '2 Stars - Average' },
                { value: '1', label: '1 Star - Poor' },
              ]}
            />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Progress (%)"
                placeholder="e.g. 45"
                type="number"
                value={progress}
                onChange={e => setProgress(e.target.value)}
              />
              <Input
                label="Current Page"
                placeholder="e.g. 150"
                type="number"
                value={currentPage}
                onChange={e => setCurrentPage(e.target.value)}
              />
              <Input
                label="Total Pages"
                placeholder="e.g. 350"
                type="number"
                value={totalPages}
                onChange={e => setTotalPages(e.target.value)}
              />
            </div>
          )}
          <Input
            label="Tags (comma separated)"
            placeholder="e.g. Database, Tech, Study"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

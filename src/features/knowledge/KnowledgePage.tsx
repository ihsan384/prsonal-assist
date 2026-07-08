import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Book, Link, Video, Headphones, Plus, Star } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchBar } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'

const typeIcons: Record<string, React.ComponentType<{ size: number }>> = {
  book: Book,
  article: Link,
  video: Video,
  course: Brain,
  podcast: Headphones,
  note: Brain,
}

const items = [
  { id: '1', title: 'Clean Architecture', author: 'Robert C. Martin', type: 'book', status: 'reading', rating: 5, tags: ['Architecture', 'Design'], progress: 65, totalPages: 432, currentPage: 281, color: '#7c6aff' },
  { id: '2', title: 'React Performance Patterns', author: 'Addy Osmani', type: 'article', status: 'completed', rating: 4, tags: ['React', 'Performance'], color: '#06b6d4' },
  { id: '3', title: 'System Design Course', author: 'ByteByteGo', type: 'course', status: 'reading', rating: 5, tags: ['Backend', 'System Design'], progress: 45, color: '#10b981' },
  { id: '4', title: 'The Pragmatic Programmer', author: 'Dave Thomas', type: 'book', status: 'want_to_read', rating: 0, tags: ['Programming', 'Career'], color: '#f59e0b' },
  { id: '5', title: 'Lex Fridman Podcast #391', author: 'Lex Fridman', type: 'podcast', status: 'completed', rating: 4, tags: ['AI', 'Tech'], color: '#f97316' },
  { id: '6', title: 'Understanding TypeScript Generics', author: 'Matt Pocock', type: 'video', status: 'completed', rating: 5, tags: ['TypeScript'], color: '#8b5cf6' },
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
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

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
      <div className="flex gap-1 bg-[#111118] rounded-xl p-1 mb-5 border border-[rgba(255,255,255,0.06)]">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id ? 'bg-[#7c6aff] text-white' : 'text-[#55556a] hover:text-[#8888a0]'
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
          <div key={s.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.06)]">
            <span className="text-lg font-bold text-[#f0f0f5]">{s.value}</span>
            <span className="text-[10px] text-[#55556a] text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="mb-5">
        <SectionHeader title="Library" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Add</Button>
        } />
        <div className="flex flex-col gap-3">
          {filtered.map((item, i) => {
            const Icon = typeIcons[item.type] ?? Brain
            const badge = statusBadge[item.status]
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
                      <p className="text-sm font-semibold text-[#f0f0f5] truncate">{item.title}</p>
                      <p className="text-xs text-[#55556a] mt-0.5">{item.author}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                        {item.tags.slice(0, 2).map(t => (
                          <Badge key={t} variant="default" size="sm">{t}</Badge>
                        ))}
                      </div>
                      {item.progress !== undefined && (
                        <div className="mt-2">
                          <ProgressBar value={item.progress} color={item.color} height={3} />
                          <p className="text-[10px] text-[#55556a] mt-0.5">
                            {item.currentPage && `Page ${item.currentPage}/${item.totalPages} · `}{item.progress}%
                          </p>
                        </div>
                      )}
                    </div>
                    {item.rating > 0 && (
                      <div className="flex flex-shrink-0">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={10} className={j < item.rating ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-[#252530]'} />
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

      <FAB onClick={() => {}} />
    </PageWrapper>
  )
}

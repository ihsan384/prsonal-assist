import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Flame, Plus, Search, X, Star, Pin, Trash2, Edit3,
  Quote, FileText, Layers, RefreshCw, Download, Upload,
  ArrowLeft, Bold, Italic, Underline, List, ListOrdered,
  Heading2, Code, Undo2, Redo2, Heart,
  BookOpen, Dumbbell, Moon, Trophy, XCircle, CheckCircle2,
  Book, Lightbulb, Shield, ScrollText,
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Modal } from '@/components/ui/Modal'
import { motivationStorage } from '@/services/storage'
import type { MotivationQuote, MotivationNote, MotivationCollection, MotivationCategory } from '@/types'
import { cn } from '@/utils/cn'

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORIES: { value: MotivationCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'motivation', label: 'Motivation', icon: Flame, color: '#f59e0b' },
  { value: 'discipline', label: 'Discipline', icon: Shield, color: '#7c3aed' },
  { value: 'success', label: 'Success', icon: Trophy, color: '#16a34a' },
  { value: 'study', label: 'Study', icon: BookOpen, color: '#2563eb' },
  { value: 'fitness', label: 'Fitness', icon: Dumbbell, color: '#06b6d4' },
  { value: 'islamic', label: 'Islamic', icon: Moon, color: '#059669' },
  { value: 'life_lessons', label: 'Life Lessons', icon: Lightbulb, color: '#d97706' },
  { value: 'books', label: 'Books', icon: Book, color: '#6366f1' },
  { value: 'quotes', label: 'Quotes', icon: Quote, color: '#ec4899' },
  { value: 'rules', label: 'Rules', icon: ScrollText, color: '#ef4444' },
  { value: 'principles', label: 'Principles', icon: Shield, color: '#8b5cf6' },
  { value: 'affirmations', label: 'Affirmations', icon: Heart, color: '#f43f5e' },
  { value: 'failures', label: 'Failures', icon: XCircle, color: '#dc2626' },
  { value: 'wins', label: 'Wins', icon: CheckCircle2, color: '#22c55e' },
  { value: 'custom', label: 'Custom', icon: Layers, color: '#64748b' },
]

const getCategoryConfig = (cat: MotivationCategory) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[CATEGORIES.length - 1]

// ─── Rich Text Editor (reused pattern) ───────────────────────────────────────

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

function RichEditor({ value, onChange, placeholder = 'Write here…', minHeight = 200 }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternal = useRef(false)

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    handleInput()
  }

  const handleInput = () => {
    isInternal.current = true
    onChange(editorRef.current?.innerHTML || '')
  }

  // Sync external value to DOM
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !isInternal.current) {
      node.innerHTML = value
    }
    editorRef.current = node
  }, [])

  const toolbarBtns = [
    { icon: Bold, cmd: 'bold', title: 'Bold' },
    { icon: Italic, cmd: 'italic', title: 'Italic' },
    { icon: Underline, cmd: 'underline', title: 'Underline' },
  ]

  return (
    <div className="flex flex-col border border-[var(--border)] rounded-[10px] overflow-hidden focus-within:border-[var(--border-focus)] focus-within:ring-1 focus-within:ring-[var(--accent)]/20 transition-all">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex-wrap">
        {toolbarBtns.map(btn => (
          <button key={btn.cmd} type="button" title={btn.title} onMouseDown={e => { e.preventDefault(); exec(btn.cmd) }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] transition-all">
            <btn.icon size={13} />
          </button>
        ))}
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
        <button type="button" title="Heading" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<h3>') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"><Heading2 size={13} /></button>
        <button type="button" title="Quote" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<blockquote>') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"><Quote size={13} /></button>
        <button type="button" title="Code" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<pre>') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"><Code size={13} /></button>
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
        <button type="button" title="Bullet List" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"><List size={13} /></button>
        <button type="button" title="Numbered List" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"><ListOrdered size={13} /></button>
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
        <button type="button" title="Undo" onMouseDown={e => { e.preventDefault(); exec('undo') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"><Undo2 size={13} /></button>
        <button type="button" title="Redo" onMouseDown={e => { e.preventDefault(); exec('redo') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"><Redo2 size={13} /></button>
      </div>
      <div
        ref={setRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="motivation-editor px-4 py-3 text-sm text-[var(--text)] outline-none"
        style={{ minHeight }}
      />
    </div>
  )
}

// ─── Daily Quote Widget ───────────────────────────────────────────────────────

function DailyQuoteWidget() {
  const [quote, setQuote] = useState<MotivationQuote | null>(() => motivationStorage.getRandomQuote())

  const refresh = () => setQuote(motivationStorage.getRandomQuote())

  if (!quote) return null

  const cat = getCategoryConfig(quote.category)

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[var(--accent-border)] bg-gradient-to-br from-[var(--accent-bg)] to-[var(--bg-subtle)] p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: cat.color + '20' }}>
          <cat.icon size={16} style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--accent)] mb-0.5 uppercase tracking-wider">Today's Quote</p>
          <blockquote className="text-sm font-medium text-[var(--text)] leading-relaxed italic mb-1.5">"{quote.quote}"</blockquote>
          {quote.author && <p className="text-xs text-[var(--text-3)]">— {quote.author}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Badge variant="default" size="sm">{cat.label}</Badge>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { motivationStorage.updateQuote(quote.id, { isFavourite: !quote.isFavourite }); setQuote(q => q ? { ...q, isFavourite: !q.isFavourite } : q) }}
            className={cn('p-1.5 rounded-[6px] transition-colors', quote.isFavourite ? 'text-yellow-500' : 'text-[var(--text-4)] hover:text-yellow-500')}
          >
            <Star size={14} className={quote.isFavourite ? 'fill-yellow-500' : ''} />
          </button>
          <button onClick={refresh} className="p-1.5 rounded-[6px] text-[var(--text-4)] hover:text-[var(--accent)] transition-colors" title="New quote">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Quote Card ───────────────────────────────────────────────────────────────

function QuoteCard({ quote, onEdit, onDelete, onToggleFav, onTogglePin, index }: {
  quote: MotivationQuote
  onEdit: () => void
  onDelete: () => void
  onToggleFav: () => void
  onTogglePin: () => void
  index: number
}) {
  const cat = getCategoryConfig(quote.category)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Card hover className="group">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: cat.color + '15' }}>
            <cat.icon size={13} style={{ color: cat.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <blockquote className="text-sm font-medium text-[var(--text)] leading-relaxed italic mb-1">"{quote.quote}"</blockquote>
            <div className="flex items-center gap-2 flex-wrap">
              {quote.author && <span className="text-xs text-[var(--text-3)]">— {quote.author}</span>}
              <Badge variant="default" size="sm">{cat.label}</Badge>
              {quote.isPinned && <Pin size={11} className="text-[var(--accent)]" />}
              {quote.isFavourite && <Star size={11} className="text-yellow-500 fill-yellow-500" />}
            </div>
            {quote.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {quote.tags.slice(0, 4).map(tag => <Badge key={tag} variant="default" size="sm">{tag}</Badge>)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={onToggleFav} className={cn('p-1 rounded-[6px]', quote.isFavourite ? 'text-yellow-500' : 'text-[var(--text-4)] hover:text-yellow-500')}>
              <Star size={13} className={quote.isFavourite ? 'fill-yellow-500' : ''} />
            </button>
            <button onClick={onTogglePin} className={cn('p-1 rounded-[6px]', quote.isPinned ? 'text-[var(--accent)]' : 'text-[var(--text-4)] hover:text-[var(--accent)]')}>
              <Pin size={13} />
            </button>
            <button onClick={onEdit} className="p-1 rounded-[6px] text-[var(--text-4)] hover:text-[var(--text)]">
              <Edit3 size={13} />
            </button>
            <button onClick={onDelete} className="p-1 rounded-[6px] text-[var(--text-4)] hover:text-[var(--error)]">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({ note, onEdit, onDelete, onToggleFav, onTogglePin, index }: {
  note: MotivationNote
  onEdit: () => void
  onDelete: () => void
  onToggleFav: () => void
  onTogglePin: () => void
  index: number
}) {
  const cat = getCategoryConfig(note.category)
  const preview = note.content.replace(/<[^>]*>/g, ' ').slice(0, 120)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Card hover onClick={onEdit} className="group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0" style={{ background: cat.color + '15' }}>
                <cat.icon size={11} style={{ color: cat.color }} />
              </div>
              <span className="text-sm font-semibold text-[var(--text)] truncate">{note.title}</span>
              {note.isPinned && <Pin size={11} className="text-[var(--accent)]" />}
              {note.isFavourite && <Star size={11} className="text-yellow-500 fill-yellow-500" />}
            </div>
            {preview && <p className="text-xs text-[var(--text-3)] leading-relaxed line-clamp-2 mb-2">{preview}…</p>}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="default" size="sm">{cat.label}</Badge>
              {note.tags.slice(0, 3).map(tag => <Badge key={tag} variant="default" size="sm">{tag}</Badge>)}
            </div>
          </div>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={onToggleFav} className={cn('p-1 rounded-[6px]', note.isFavourite ? 'text-yellow-500' : 'text-[var(--text-4)] hover:text-yellow-500')}>
              <Star size={13} className={note.isFavourite ? 'fill-yellow-500' : ''} />
            </button>
            <button onClick={onTogglePin} className={cn('p-1 rounded-[6px]', note.isPinned ? 'text-[var(--accent)]' : 'text-[var(--text-4)] hover:text-[var(--accent)]')}>
              <Pin size={13} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-1 rounded-[6px] text-[var(--text-4)] hover:text-[var(--error)]">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Collection Card ──────────────────────────────────────────────────────────

function CollectionCard({ collection, quoteCount, noteCount, onEdit, onDelete, index }: {
  collection: MotivationCollection
  quoteCount: number
  noteCount: number
  onEdit: () => void
  onDelete: () => void
  index: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Card hover onClick={onEdit} className="group">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg shrink-0 border border-[var(--border)]" style={{ background: collection.color + '20' }}>
              {collection.icon || '📚'}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{collection.name}</p>
              {collection.description && <p className="text-xs text-[var(--text-3)] mt-0.5">{collection.description}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[var(--text-4)]">{quoteCount} quotes</span>
                <span className="text-[10px] text-[var(--text-4)]">{noteCount} notes</span>
              </div>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onDelete() }} className="opacity-0 group-hover:opacity-100 p-1 rounded-[6px] text-[var(--text-4)] hover:text-[var(--error)] transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Quote Editor Modal ───────────────────────────────────────────────────────

function QuoteEditorModal({ quote, onClose, onSave }: {
  quote?: MotivationQuote | null
  onClose: () => void
  onSave: () => void
}) {
  const [text, setText] = useState(quote?.quote || '')
  const [author, setAuthor] = useState(quote?.author || '')
  const [source, setSource] = useState(quote?.source || '')
  const [category, setCategory] = useState<MotivationCategory>(quote?.category || 'motivation')
  const [tags, setTags] = useState(quote?.tags.join(', ') || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const payload = {
      quote: text.trim(),
      author: author.trim() || undefined,
      source: source.trim() || undefined,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isFavourite: quote?.isFavourite || false,
      isPinned: quote?.isPinned || false,
      collectionIds: quote?.collectionIds || [],
    }
    if (quote) {
      motivationStorage.updateQuote(quote.id, payload)
    } else {
      motivationStorage.addQuote(payload)
    }
    onSave()
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} title={quote ? 'Edit Quote' : 'Add Quote'} size="md">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--text-2)]">Quote *</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter the quote…"
            rows={3}
            required
            autoFocus
            className="w-full p-3 rounded-[8px] text-sm bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all resize-y"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Author" placeholder="e.g. Marcus Aurelius" value={author} onChange={e => setAuthor(e.target.value)} />
          <Input label="Source" placeholder="e.g. Meditations" value={source} onChange={e => setSource(e.target.value)} />
        </div>
        <Select
          label="Category"
          value={category}
          onChange={e => setCategory(e.target.value as MotivationCategory)}
          options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
        />
        <Input label="Tags (comma separated)" placeholder="e.g. stoic, mindset" value={tags} onChange={e => setTags(e.target.value)} />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Save Quote</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Note Editor (Full-screen) ────────────────────────────────────────────────

function NoteEditorScreen({ note, onClose, onSave }: {
  note?: MotivationNote | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [category, setCategory] = useState<MotivationCategory>(note?.category || 'motivation')
  const [tags, setTags] = useState(note?.tags.join(', ') || '')

  const handleSave = () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      content,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isFavourite: note?.isFavourite || false,
      isPinned: note?.isPinned || false,
      collectionIds: note?.collectionIds || [],
    }
    if (note) {
      motivationStorage.updateNote(note.id, payload)
    } else {
      motivationStorage.addNote(payload)
    }
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border)] shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-sm font-semibold text-[var(--text)]">{note ? 'Edit Note' : 'New Note'}</p>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!title.trim()}>Save Note</Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
          <Input label="Title *" placeholder="Note title…" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={category} onChange={e => setCategory(e.target.value as MotivationCategory)} options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))} />
            <Input label="Tags" placeholder="e.g. mindset, focus" value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-2)] block mb-2">Content</label>
            <RichEditor value={content} onChange={setContent} placeholder="Write your note here…" minHeight={350} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Collection Editor Modal ──────────────────────────────────────────────────

function CollectionEditorModal({ collection, onClose, onSave }: {
  collection?: MotivationCollection | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(collection?.name || '')
  const [description, setDescription] = useState(collection?.description || '')
  const [color, setColor] = useState(collection?.color || '#2563eb')
  const [icon, setIcon] = useState(collection?.icon || '📚')

  const EMOJI_OPTIONS = ['📚', '🔥', '💪', '🧠', '⚡', '🌟', '🎯', '💎', '🏆', '📖', '🕌', '💡', '🛡️', '⚖️', '🌙', '✨']

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const payload = { name: name.trim(), description: description.trim() || undefined, color, icon }
    if (collection) {
      motivationStorage.updateCollection(collection.id, payload)
    } else {
      motivationStorage.addCollection(payload)
    }
    onSave()
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} title={collection ? 'Edit Collection' : 'New Collection'} size="sm">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Input label="Collection Name *" placeholder="e.g. IIT Motivation" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <Input label="Description" placeholder="What's this collection about?" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-2)]">Icon</label>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} type="button" onClick={() => setIcon(e)} className={cn('w-8 h-8 rounded-[8px] text-base flex items-center justify-center border transition-all', icon === e ? 'border-[var(--accent)] bg-[var(--accent-bg)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]')}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-2)]">Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-full rounded-[8px] border border-[var(--border)] cursor-pointer" />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'quotes' | 'notes' | 'collections'
type QuoteFilter = 'all' | 'favourite' | 'pinned'

export default function MotivationPage() {
  const [tab, setTab] = useState<Tab>('quotes')
  const [quotes, setQuotes] = useState<MotivationQuote[]>(() => motivationStorage.getQuotes())
  const [notes, setNotes] = useState<MotivationNote[]>(() => motivationStorage.getNotes())
  const [collections, setCollections] = useState<MotivationCollection[]>(() => motivationStorage.getCollections())

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<MotivationCategory | 'all'>('all')
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>('all')

  const [showQuoteEditor, setShowQuoteEditor] = useState(false)
  const [editingQuote, setEditingQuote] = useState<MotivationQuote | null>(null)
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<MotivationNote | null>(null)
  const [showCollectionEditor, setShowCollectionEditor] = useState(false)
  const [editingCollection, setEditingCollection] = useState<MotivationCollection | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'quote' | 'note' | 'collection'; id: string } | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')

  const reload = () => {
    setQuotes(motivationStorage.getQuotes())
    setNotes(motivationStorage.getNotes())
    setCollections(motivationStorage.getCollections())
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'quote') motivationStorage.removeQuote(deleteTarget.id)
    if (deleteTarget.type === 'note') motivationStorage.removeNote(deleteTarget.id)
    if (deleteTarget.type === 'collection') motivationStorage.removeCollection(deleteTarget.id)
    setDeleteTarget(null)
    reload()
  }

  const handleExport = () => {
    const data = tab === 'quotes' ? motivationStorage.exportQuotesJSON() : motivationStorage.exportNotesJSON()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tab === 'quotes' ? 'motivation-quotes.json' : 'motivation-notes.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    motivationStorage.importQuotesJSON(importJson)
    setImportJson('')
    setShowImport(false)
    reload()
  }

  // Filter logic
  const filteredQuotes = quotes.filter(q => {
    const matchCat = categoryFilter === 'all' || q.category === categoryFilter
    const matchFilter = quoteFilter === 'all' || (quoteFilter === 'favourite' && q.isFavourite) || (quoteFilter === 'pinned' && q.isPinned)
    const matchSearch = !search || q.quote.toLowerCase().includes(search.toLowerCase()) || (q.author || '').toLowerCase().includes(search.toLowerCase()) || q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchFilter && matchSearch
  }).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    if (a.isFavourite !== b.isFavourite) return a.isFavourite ? -1 : 1
    return b.createdAt.localeCompare(a.createdAt)
  })

  const filteredNotes = notes.filter(n => {
    const matchCat = categoryFilter === 'all' || n.category === categoryFilter
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.replace(/<[^>]*>/g, '').toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  }).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    if (a.isFavourite !== b.isFavourite) return a.isFavourite ? -1 : 1
    return b.updatedAt.localeCompare(a.updatedAt)
  })

  return (
    <>
      {/* Note Editor Full Screen */}
      {showNoteEditor && (
        <NoteEditorScreen
          note={editingNote}
          onClose={() => { setShowNoteEditor(false); setEditingNote(null) }}
          onSave={reload}
        />
      )}

      {/* Quote Editor Modal */}
      {showQuoteEditor && (
        <QuoteEditorModal
          quote={editingQuote}
          onClose={() => { setShowQuoteEditor(false); setEditingQuote(null) }}
          onSave={reload}
        />
      )}

      {/* Collection Editor Modal */}
      {showCollectionEditor && (
        <CollectionEditorModal
          collection={editingCollection}
          onClose={() => { setShowCollectionEditor(false); setEditingCollection(null) }}
          onSave={reload}
        />
      )}

      <PageWrapper>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#fff7ed] flex items-center justify-center">
              <Flame size={16} className="text-[#f59e0b]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--text)]">Motivation Center</h1>
              <p className="text-[11px] text-[var(--text-4)]">Personal discipline & wisdom library</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="p-1.5 rounded-[8px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all" title="Export">
              <Download size={15} />
            </button>
            <button onClick={() => setShowImport(true)} className="p-1.5 rounded-[8px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all" title="Import JSON">
              <Upload size={15} />
            </button>
            <Button variant="primary" size="sm" onClick={() => {
              if (tab === 'quotes') { setEditingQuote(null); setShowQuoteEditor(true) }
              else if (tab === 'notes') { setEditingNote(null); setShowNoteEditor(true) }
              else { setEditingCollection(null); setShowCollectionEditor(true) }
            }}>
              <Plus size={14} />
              <span className="hidden sm:inline">Add {tab === 'quotes' ? 'Quote' : tab === 'notes' ? 'Note' : 'Collection'}</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Daily Quote Widget */}
        {quotes.length > 0 && <DailyQuoteWidget />}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Quotes', value: quotes.length, icon: Quote, color: '#ec4899' },
            { label: 'Notes', value: notes.length, icon: FileText, color: '#2563eb' },
            { label: 'Collections', value: collections.length, icon: Layers, color: '#7c3aed' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm">
              <stat.icon size={15} style={{ color: stat.color }} />
              <span className="text-lg font-bold text-[var(--text)] tabular-nums">{stat.value}</span>
              <span className="text-[9px] text-[var(--text-4)] uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--bg-subtle)] rounded-xl p-1 border border-[var(--border)]">
          {(['quotes', 'notes', 'collections'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                tab === t ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        {(tab === 'quotes' || tab === 'notes') && (
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-4)] pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === 'quotes' ? 'Search quotes…' : 'Search notes…'} className="w-full h-8 pl-8 pr-8 rounded-[8px] text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--border-focus)] transition-all" />
              {search && <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-3)]" onClick={() => setSearch('')}><X size={12} /></button>}
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as any)} className="h-8 pl-3 pr-8 rounded-[8px] text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none appearance-none cursor-pointer">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {tab === 'quotes' && (
              <select value={quoteFilter} onChange={e => setQuoteFilter(e.target.value as QuoteFilter)} className="h-8 pl-3 pr-8 rounded-[8px] text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none appearance-none cursor-pointer">
                <option value="all">All</option>
                <option value="favourite">Favourites</option>
                <option value="pinned">Pinned</option>
              </select>
            )}
          </div>
        )}

        {/* Quotes Tab */}
        {tab === 'quotes' && (
          <div className="flex flex-col gap-3">
            {filteredQuotes.length === 0 ? (
              <EmptyState
                icon={<Quote size={24} />}
                title={search || categoryFilter !== 'all' ? 'No quotes found' : 'No quotes yet'}
                description={search || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first quote — a line that moves you.'}
                action={!search && categoryFilter === 'all' ? <Button variant="primary" size="sm" onClick={() => { setEditingQuote(null); setShowQuoteEditor(true) }}>Add First Quote</Button> : undefined}
              />
            ) : filteredQuotes.map((q, i) => (
              <QuoteCard
                key={q.id}
                quote={q}
                index={i}
                onEdit={() => { setEditingQuote(q); setShowQuoteEditor(true) }}
                onDelete={() => setDeleteTarget({ type: 'quote', id: q.id })}
                onToggleFav={() => { motivationStorage.updateQuote(q.id, { isFavourite: !q.isFavourite }); reload() }}
                onTogglePin={() => { motivationStorage.updateQuote(q.id, { isPinned: !q.isPinned }); reload() }}
              />
            ))}
          </div>
        )}

        {/* Notes Tab */}
        {tab === 'notes' && (
          <div className="flex flex-col gap-3">
            {filteredNotes.length === 0 ? (
              <EmptyState
                icon={<FileText size={24} />}
                title={search || categoryFilter !== 'all' ? 'No notes found' : 'No notes yet'}
                description={search || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Capture lessons, principles, and insights.'}
                action={!search && categoryFilter === 'all' ? <Button variant="primary" size="sm" onClick={() => { setEditingNote(null); setShowNoteEditor(true) }}>Write First Note</Button> : undefined}
              />
            ) : filteredNotes.map((n, i) => (
              <NoteCard
                key={n.id}
                note={n}
                index={i}
                onEdit={() => { setEditingNote(n); setShowNoteEditor(true) }}
                onDelete={() => setDeleteTarget({ type: 'note', id: n.id })}
                onToggleFav={() => { motivationStorage.updateNote(n.id, { isFavourite: !n.isFavourite }); reload() }}
                onTogglePin={() => { motivationStorage.updateNote(n.id, { isPinned: !n.isPinned }); reload() }}
              />
            ))}
          </div>
        )}

        {/* Collections Tab */}
        {tab === 'collections' && (
          <div className="flex flex-col gap-3">
            {collections.length === 0 ? (
              <EmptyState
                icon={<Layers size={24} />}
                title="No collections yet"
                description="Group your quotes and notes into themed collections."
                action={<Button variant="primary" size="sm" onClick={() => { setEditingCollection(null); setShowCollectionEditor(true) }}>Create First Collection</Button>}
              />
            ) : collections.map((c, i) => (
              <CollectionCard
                key={c.id}
                collection={c}
                quoteCount={quotes.filter(q => q.collectionIds.includes(c.id)).length}
                noteCount={notes.filter(n => n.collectionIds.includes(c.id)).length}
                index={i}
                onEdit={() => { setEditingCollection(c); setShowCollectionEditor(true) }}
                onDelete={() => setDeleteTarget({ type: 'collection', id: c.id })}
              />
            ))}
          </div>
        )}
      </PageWrapper>

      {/* Delete Confirm */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget?.type === 'quote' ? 'Quote' : deleteTarget?.type === 'note' ? 'Note' : 'Collection'}`}
        description="Are you sure you want to permanently delete this item?"
      />

      {/* Import Modal */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title="Import Quotes (JSON)" size="md">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-[var(--text-3)]">Paste a JSON array of quotes exported from Ihsan OS.</p>
          <textarea
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            placeholder='[{"quote": "...", "author": "...", ...}]'
            rows={8}
            className="w-full p-3 rounded-[8px] text-xs font-mono bg-[var(--bg-subtle)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-[var(--border-focus)] resize-y"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowImport(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleImport} disabled={!importJson.trim()}>Import</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

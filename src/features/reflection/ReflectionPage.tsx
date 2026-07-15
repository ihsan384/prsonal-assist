import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookMarked, Plus, Search, X, Star, Pin, Trash2, Edit3,
  ChevronDown, ChevronRight,
  Clock, Zap, Brain, AlertTriangle, CheckCircle2,
  SmilePlus, Frown, Meh, Smile, Laugh,
  ArrowLeft, Bold, Italic, Underline, List, ListOrdered,
  Quote, Code, Heading2, Minus, Undo2, Redo2,
  TrendingUp, FileText, Calendar, Flame,
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { reflectionStorage } from '@/services/storage'
import type { ReflectionEntry, ReflectionMood } from '@/types'
import { cn } from '@/utils/cn'

// ─── Mood Config ─────────────────────────────────────────────────────────────

const MOODS: { value: ReflectionMood; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { value: 'amazing', label: 'Amazing', icon: Laugh, color: '#16a34a', bg: '#f0fdf4' },
  { value: 'good', label: 'Good', icon: Smile, color: '#2563eb', bg: '#eff6ff' },
  { value: 'okay', label: 'Okay', icon: Meh, color: '#d97706', bg: '#fffbeb' },
  { value: 'bad', label: 'Bad', icon: Frown, color: '#dc2626', bg: '#fef2f2' },
  { value: 'terrible', label: 'Terrible', icon: AlertTriangle, color: '#7c3aed', bg: '#f5f3ff' },
]

const getMoodConfig = (mood: ReflectionMood) => MOODS.find(m => m.value === mood) || MOODS[2]

// ─── Word Counter ─────────────────────────────────────────────────────────────

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}

function countChars(html: string): number {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').length
}

function readingTime(wordCount: number): string {
  const mins = Math.ceil(wordCount / 200)
  return mins < 1 ? '< 1 min' : `${mins} min read`
}

// ─── Rich Text Editor ────────────────────────────────────────────────────────

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

function RichEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 300 }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternal = useRef(false)

  useEffect(() => {
    if (editorRef.current && !isInternal.current) {
      editorRef.current.innerHTML = value
    }
    isInternal.current = false
  }, [value])

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    handleInput()
  }

  const handleInput = () => {
    isInternal.current = true
    onChange(editorRef.current?.innerHTML || '')
  }

  const toolbarBtns = [
    { icon: Bold, cmd: 'bold', title: 'Bold' },
    { icon: Italic, cmd: 'italic', title: 'Italic' },
    { icon: Underline, cmd: 'underline', title: 'Underline' },
    { icon: Minus, cmd: 'strikeThrough', title: 'Strikethrough' },
  ]

  return (
    <div className="flex flex-col border border-[var(--border)] rounded-[10px] overflow-hidden focus-within:border-[var(--border-focus)] focus-within:ring-1 focus-within:ring-[var(--accent)]/20 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex-wrap">
        {toolbarBtns.map(btn => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={e => { e.preventDefault(); exec(btn.cmd) }}
            className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] transition-all"
          >
            <btn.icon size={13} />
          </button>
        ))}
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
        <button type="button" title="Heading" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<h3>') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all">
          <Heading2 size={13} />
        </button>
        <button type="button" title="Quote" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<blockquote>') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all">
          <Quote size={13} />
        </button>
        <button type="button" title="Code" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<pre>') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all">
          <Code size={13} />
        </button>
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
        <button type="button" title="Bullet List" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all">
          <List size={13} />
        </button>
        <button type="button" title="Numbered List" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all">
          <ListOrdered size={13} />
        </button>
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
        <button type="button" title="Undo" onMouseDown={e => { e.preventDefault(); exec('undo') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all">
          <Undo2 size={13} />
        </button>
        <button type="button" title="Redo" onMouseDown={e => { e.preventDefault(); exec('redo') }} className="p-1.5 rounded-[6px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all">
          <Redo2 size={13} />
        </button>
      </div>
      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="reflection-editor px-4 py-3 text-sm text-[var(--text)] outline-none"
        style={{ minHeight }}
      />
    </div>
  )
}

// ─── Slider Component ─────────────────────────────────────────────────────────

function RatingSlider({ label, value, onChange, color = 'var(--accent)' }: {
  label: string
  value: number
  onChange: (v: number) => void
  color?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-2)]">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }}
      />
    </div>
  )
}

// ─── Reflection Question Accordion ───────────────────────────────────────────

function QuestionAccordion({ question, value, onChange, placeholder }: {
  question: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-[var(--border)] rounded-[10px] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] transition-all text-left"
      >
        <span className="text-xs font-medium text-[var(--text-2)]">{question}</span>
        <div className="flex items-center gap-2">
          {value && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
          {open ? <ChevronDown size={14} className="text-[var(--text-4)]" /> : <ChevronRight size={14} className="text-[var(--text-4)]" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] outline-none resize-none border-t border-[var(--border)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Editor Modal ─────────────────────────────────────────────────────────────

interface EditorProps {
  entry?: ReflectionEntry | null
  onClose: () => void
  onSave: () => void
}

function ReflectionEditor({ entry, onClose, onSave }: EditorProps) {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const [date, setDate] = useState(entry?.date || todayStr)
  const [startTime, setStartTime] = useState(entry?.startTime || now.toTimeString().slice(0, 5))
  const [endTime, setEndTime] = useState(entry?.endTime || '')
  const [mood, setMood] = useState<ReflectionMood>(entry?.mood || 'good')
  const [energy, setEnergy] = useState(entry?.energyLevel || 7)
  const [focus, setFocus] = useState(entry?.focusLevel || 7)
  const [productivity, setProductivity] = useState(entry?.productivityRating || 7)
  const [stress, setStress] = useState(entry?.stressLevel || 4)
  const [sleepQuality, setSleepQuality] = useState(entry?.sleepQuality || '')
  const [weather, setWeather] = useState(entry?.weather || '')
  const [location, setLocation] = useState(entry?.location || '')
  const [content, setContent] = useState(entry?.content || '')
  const [howWasToday, setHowWasToday] = useState(entry?.howWasToday || '')
  const [accomplishments, setAccomplishments] = useState(entry?.accomplishments || '')
  const [distractions, setDistractions] = useState(entry?.distractions || '')
  const [learnings, setLearnings] = useState(entry?.learnings || '')
  const [happiness, setHappiness] = useState(entry?.happiness || '')
  const [frustrations, setFrustrations] = useState(entry?.frustrations || '')
  const [mistakes, setMistakes] = useState(entry?.mistakes || '')
  const [improvements, setImprovements] = useState(entry?.improvements || '')
  const [iitProgress, setIitProgress] = useState(entry?.iitProgress || '')
  const [timeWasted, setTimeWasted] = useState(entry?.timeWasted || '')
  const [gratitude, setGratitude] = useState(entry?.gratitude || '')
  const [tomorrowPriorities, setTomorrowPriorities] = useState(entry?.tomorrowPriorities || '')
  const [freeNotes, setFreeNotes] = useState(entry?.freeNotes || '')
  const [tags, setTags] = useState(entry?.tags.join(', ') || '')
  const [autoSaveMsg, setAutoSaveMsg] = useState('')

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildPayload = useCallback(() => ({
    date,
    dayOfWeek: dayNames[new Date(date + 'T00:00:00').getDay()],
    startTime,
    endTime,
    mood,
    energyLevel: energy,
    focusLevel: focus,
    productivityRating: productivity,
    stressLevel: stress,
    sleepQuality: sleepQuality as any || undefined,
    weather: weather || undefined,
    location: location || undefined,
    content,
    howWasToday: howWasToday || undefined,
    accomplishments: accomplishments || undefined,
    distractions: distractions || undefined,
    learnings: learnings || undefined,
    happiness: happiness || undefined,
    frustrations: frustrations || undefined,
    mistakes: mistakes || undefined,
    improvements: improvements || undefined,
    iitProgress: iitProgress || undefined,
    timeWasted: timeWasted || undefined,
    gratitude: gratitude || undefined,
    tomorrowPriorities: tomorrowPriorities || undefined,
    freeNotes: freeNotes || undefined,
    wordCount: countWords(content),
    isPinned: entry?.isPinned || false,
    isFavourite: entry?.isFavourite || false,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
  }), [date, startTime, endTime, mood, energy, focus, productivity, stress, sleepQuality, weather, location, content, howWasToday, accomplishments, distractions, learnings, happiness, frustrations, mistakes, improvements, iitProgress, timeWasted, gratitude, tomorrowPriorities, freeNotes, tags, entry])

  // Auto-save
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (!content && !howWasToday) return
      const payload = buildPayload()
      if (entry) {
        reflectionStorage.update(entry.id, payload)
      }
      setAutoSaveMsg('Auto-saved')
      setTimeout(() => setAutoSaveMsg(''), 2000)
    }, 30000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [content, howWasToday, buildPayload, entry])

  const handleSave = () => {
    const payload = buildPayload()
    if (entry) {
      reflectionStorage.update(entry.id, payload)
    } else {
      reflectionStorage.add(payload)
    }
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border)] shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2">
          {autoSaveMsg && (
            <span className="text-xs text-[var(--success)] flex items-center gap-1">
              <CheckCircle2 size={12} /> {autoSaveMsg}
            </span>
          )}
          <span className="text-xs text-[var(--text-4)]">{countWords(content)} words · {readingTime(countWords(content))}</span>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          Save Entry
        </Button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">

          {/* Meta Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            <Select label="Sleep Quality" value={sleepQuality} onChange={e => setSleepQuality(e.target.value)} options={[
              { value: '', label: '— Select —' },
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
            ]} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Weather (optional)" placeholder="e.g. Sunny, Rainy…" value={weather} onChange={e => setWeather(e.target.value)} />
            <Input label="Location (optional)" placeholder="e.g. Home, Library…" value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          {/* Mood */}
          <div>
            <p className="text-xs font-medium text-[var(--text-2)] mb-2">Today's Mood</p>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-all',
                    mood === m.value
                      ? 'border-transparent'
                      : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--border-strong)]'
                  )}
                  style={mood === m.value ? { background: m.bg, color: m.color, borderColor: m.color + '40' } : {}}
                >
                  <m.icon size={14} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <Card padding="md">
            <p className="text-xs font-semibold text-[var(--text-2)] mb-4">Daily Ratings</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RatingSlider label="Energy Level" value={energy} onChange={setEnergy} color="#16a34a" />
              <RatingSlider label="Focus Level" value={focus} onChange={setFocus} color="#2563eb" />
              <RatingSlider label="Productivity" value={productivity} onChange={setProductivity} color="#7c3aed" />
              <RatingSlider label="Stress Level" value={stress} onChange={setStress} color="#dc2626" />
            </div>
          </Card>

          {/* Main Writing Area */}
          <div>
            <p className="text-xs font-medium text-[var(--text-2)] mb-2">Main Journal Entry</p>
            <RichEditor value={content} onChange={setContent} placeholder="Write about your day…" minHeight={280} />
            <p className="text-[10px] text-[var(--text-4)] mt-1.5">{countWords(content)} words · {countChars(content)} chars · {readingTime(countWords(content))}</p>
          </div>

          {/* Reflection Questions */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-2)] mb-3">Reflection Questions</p>
            <div className="flex flex-col gap-2">
              <QuestionAccordion question="How was today overall?" value={howWasToday} onChange={setHowWasToday} placeholder="Summarise your day in a few sentences…" />
              <QuestionAccordion question="What did I accomplish today?" value={accomplishments} onChange={setAccomplishments} placeholder="List your wins, completed tasks, goals hit…" />
              <QuestionAccordion question="What distracted me today?" value={distractions} onChange={setDistractions} placeholder="Social media, noise, thoughts…" />
              <QuestionAccordion question="What did I learn today?" value={learnings} onChange={setLearnings} placeholder="Concepts, insights, new skills…" />
              <QuestionAccordion question="What made me happy?" value={happiness} onChange={setHappiness} placeholder="Moments of joy, gratitude, positivity…" />
              <QuestionAccordion question="What frustrated me?" value={frustrations} onChange={setFrustrations} placeholder="Struggles, setbacks, irritations…" />
              <QuestionAccordion question="What mistakes did I make?" value={mistakes} onChange={setMistakes} placeholder="Errors, poor decisions, missed opportunities…" />
              <QuestionAccordion question="How can I improve tomorrow?" value={improvements} onChange={setImprovements} placeholder="Action items, mindset shifts…" />
              <QuestionAccordion question="Did I move closer to IIT today?" value={iitProgress} onChange={setIitProgress} placeholder="Study hours, quality of preparation…" />
              <QuestionAccordion question="Did I waste time today?" value={timeWasted} onChange={setTimeWasted} placeholder="Be honest — what did you waste time on?" />
              <QuestionAccordion question="What am I grateful for?" value={gratitude} onChange={setGratitude} placeholder="3 things you're thankful for…" />
              <QuestionAccordion question="Tomorrow's Top 3 Priorities" value={tomorrowPriorities} onChange={setTomorrowPriorities} placeholder="1. \n2. \n3. " />
              <QuestionAccordion question="Free Notes" value={freeNotes} onChange={setFreeNotes} placeholder="Anything else on your mind…" />
            </div>
          </div>

          {/* Tags */}
          <Input label="Tags (comma separated)" placeholder="e.g. study, productive, focus" value={tags} onChange={e => setTags(e.target.value)} />
        </div>
      </div>
    </div>
  )
}

// ─── Entry Card ───────────────────────────────────────────────────────────────

function EntryCard({ entry, onEdit, onDelete, onTogglePin, onToggleFavourite, index }: {
  entry: ReflectionEntry
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
  onToggleFavourite: () => void
  index: number
}) {
  const mood = getMoodConfig(entry.mood)
  const previewText = entry.content.replace(/<[^>]*>/g, ' ').slice(0, 120)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card hover onClick={onEdit} className="group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Date + Mood */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-[var(--text)]">{entry.dayOfWeek}, {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: mood.bg, color: mood.color }}>
                <mood.icon size={10} />
                {mood.label}
              </span>
              {entry.isPinned && <Pin size={12} className="text-[var(--accent)]" />}
              {entry.isFavourite && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
            </div>

            {/* Preview */}
            {previewText && (
              <p className="text-xs text-[var(--text-3)] leading-relaxed line-clamp-2 mb-2">{previewText}…</p>
            )}

            {/* Ratings row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-4)]">
                <Zap size={10} style={{ color: '#16a34a' }} /> {entry.energyLevel}/10
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-4)]">
                <Brain size={10} style={{ color: '#2563eb' }} /> {entry.focusLevel}/10
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-4)]">
                <TrendingUp size={10} style={{ color: '#7c3aed' }} /> {entry.productivityRating}/10
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-4)]">
                <FileText size={10} /> {entry.wordCount} words
              </span>
              {entry.startTime && (
                <span className="flex items-center gap-1 text-[10px] text-[var(--text-4)]">
                  <Clock size={10} /> {entry.startTime}{entry.endTime ? ` – ${entry.endTime}` : ''}
                </span>
              )}
            </div>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {entry.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={onToggleFavourite} className={cn('p-1 rounded-[6px] transition-colors', entry.isFavourite ? 'text-yellow-500' : 'text-[var(--text-4)] hover:text-yellow-500')}>
              <Star size={13} className={entry.isFavourite ? 'fill-yellow-500' : ''} />
            </button>
            <button onClick={onTogglePin} className={cn('p-1 rounded-[6px] transition-colors', entry.isPinned ? 'text-[var(--accent)]' : 'text-[var(--text-4)] hover:text-[var(--accent)]')}>
              <Pin size={13} />
            </button>
            <button onClick={onDelete} className="p-1 rounded-[6px] text-[var(--text-4)] hover:text-[var(--error)] transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────

function StatsPanel({ entries }: { entries: ReflectionEntry[] }) {
  const streak = reflectionStorage.getStreak()
  const thisMonth = entries.filter(e => {
    const d = new Date(e.date)
    const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  })
  const avgWords = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.wordCount, 0) / entries.length) : 0
  const moodCounts = MOODS.map(m => ({ ...m, count: entries.filter(e => e.mood === m.value).length }))
  const topMood = moodCounts.reduce((a, b) => a.count >= b.count ? a : b, moodCounts[0])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
      {[
        { label: 'Writing Streak', value: `${streak}`, unit: 'days', icon: Flame, color: '#f59e0b' },
        { label: 'This Month', value: `${thisMonth.length}`, unit: 'entries', icon: Calendar, color: '#2563eb' },
        { label: 'Avg Words', value: `${avgWords}`, unit: 'per entry', icon: FileText, color: '#7c3aed' },
        { label: 'Top Mood', value: topMood.count > 0 ? topMood.label : '—', unit: '', icon: SmilePlus, color: topMood.count > 0 ? topMood.color : 'var(--text-4)' },
      ].map(stat => (
        <div key={stat.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm">
          <stat.icon size={16} style={{ color: stat.color }} />
          <span className="text-lg font-bold text-[var(--text)] tabular-nums">{stat.value}</span>
          {stat.unit && <span className="text-[10px] text-[var(--text-3)] font-medium">{stat.unit}</span>}
          <span className="text-[9px] text-[var(--text-4)] uppercase tracking-wider text-center">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReflectionPage() {
  const [entries, setEntries] = useState<ReflectionEntry[]>(() => reflectionStorage.getAll())
  const [search, setSearch] = useState('')
  const [filterMood, setFilterMood] = useState<ReflectionMood | 'all'>('all')
  const [showEditor, setShowEditor] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ReflectionEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const reload = () => setEntries(reflectionStorage.getAll())

  const handleEdit = (entry: ReflectionEntry) => {
    setEditingEntry(entry)
    setShowEditor(true)
  }

  const handleNew = () => {
    setEditingEntry(null)
    setShowEditor(true)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingEntry(null)
    reload()
  }

  const handleDeleteConfirm = () => {
    if (deleteId) reflectionStorage.remove(deleteId)
    setDeleteId(null)
    reload()
  }

  const sorted = [...entries].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return b.date.localeCompare(a.date)
  })

  const filtered = sorted.filter(e => {
    const matchMood = filterMood === 'all' || e.mood === filterMood
    const matchSearch = !search || e.date.includes(search) || e.dayOfWeek.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) || e.howWasToday?.toLowerCase().includes(search.toLowerCase())
    return matchMood && matchSearch
  })

  const todayEntry = reflectionStorage.getToday()

  return (
    <>
      {showEditor && (
        <ReflectionEditor
          entry={editingEntry}
          onClose={handleCloseEditor}
          onSave={() => { reload(); handleCloseEditor() }}
        />
      )}

      <PageWrapper>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--accent-bg)] flex items-center justify-center">
              <BookMarked size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--text)]">Daily Reflection</h1>
              <p className="text-[11px] text-[var(--text-4)]">Night journal & diary</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleNew}>
            <Plus size={14} />
            <span className="hidden sm:inline">{todayEntry ? 'Edit Today' : 'New Entry'}</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* Today's card */}
        {todayEntry && (
          <Card className="border-[var(--accent-border)] bg-[var(--accent-bg)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--accent-text)] mb-0.5">Today's Reflection</p>
                <div className="flex items-center gap-3">
                  {(() => { const m = getMoodConfig(todayEntry.mood); return <span className="flex items-center gap-1 text-xs font-medium" style={{ color: m.color }}><m.icon size={13} /> {m.label}</span> })()}
                  <span className="text-xs text-[var(--accent-text)]">{todayEntry.wordCount} words</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleEdit(todayEntry)}>
                <Edit3 size={13} /> Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
        {entries.length > 0 && <StatsPanel entries={entries} />}

        {/* Search + Filter */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-4)] pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries…"
              className="w-full h-8 pl-8 pr-8 rounded-[8px] text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all"
            />
            {search && (
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-3)]" onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>
          <select
            value={filterMood}
            onChange={e => setFilterMood(e.target.value as any)}
            className="h-8 pl-3 pr-8 rounded-[8px] text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--border-focus)] appearance-none cursor-pointer"
          >
            <option value="all">All Moods</option>
            {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <EmptyState
            icon={<BookMarked size={24} />}
            title="No reflections yet"
            description="Start your first night journal. Review your day, capture thoughts, and track your growth."
            action={<Button variant="primary" size="sm" onClick={handleNew}>Write your first entry</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title="No entries found"
            description="Try adjusting your search or mood filter."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={i}
                onEdit={() => handleEdit(entry)}
                onDelete={() => setDeleteId(entry.id)}
                onTogglePin={() => { reflectionStorage.update(entry.id, { isPinned: !entry.isPinned }); reload() }}
                onToggleFavourite={() => { reflectionStorage.update(entry.id, { isFavourite: !entry.isFavourite }); reload() }}
              />
            ))}
          </div>
        )}

        <DeleteConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Entry"
          description="Are you sure you want to permanently delete this reflection entry?"
        />
      </PageWrapper>
    </>
  )
}

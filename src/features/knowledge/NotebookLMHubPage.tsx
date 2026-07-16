import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, BookOpen, Star, Pin, Archive, Trash2, Plus, ExternalLink, Search, Tag, Folder, Clock, Edit2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { notebookStorage } from '@/services/storage'
import { useToast } from '@/hooks/useToast'

const collectionsList = ['Physics', 'Chemistry', 'Maths', 'JEE Revision', 'Programming', 'AI', 'General']

export default function NotebookLMHubPage() {
  const toast = useToast()
  const [notebooks, setNotebooks] = useState<any[]>(() => notebookStorage.getAll())
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Form states
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Study')
  const [tags, setTags] = useState('')
  const [selectedCollections, setSelectedCollections] = useState<string[]>(['General'])
  const [readingTime, setReadingTime] = useState('')

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [notebookToDelete, setNotebookToDelete] = useState<string | null>(null)

  // Seed study collections if clean install
  useEffect(() => {
    const list = notebookStorage.getAll()
    if (list.length === 0) {
      const examples = [
        {
          name: 'Physics Electromagnetism Notes',
          url: 'https://notebooklm.google.com',
          description: 'Maxwell equations, field calculations, magnetic induction guides.',
          category: 'Physics',
          tags: ['physics', 'electromagnetism', 'formulas'],
          collections: ['Physics', 'JEE Revision'],
          isPinned: true,
          estimatedReadingTime: '25m'
        },
        {
          name: 'Organic Chemistry Mechanics',
          url: 'https://notebooklm.google.com',
          description: 'Nucleophilic substitutions, stereochemistry, naming conventions.',
          category: 'Chemistry',
          tags: ['chemistry', 'organic', 'reactions'],
          collections: ['Chemistry', 'JEE Revision'],
          isFavourite: true,
          estimatedReadingTime: '40m'
        },
        {
          name: 'AI & Neural Networks Guide',
          url: 'https://notebooklm.google.com',
          description: 'Transformers paper, backpropagation derivations, attention mechanisms.',
          category: 'AI',
          tags: ['ai', 'transformers', 'deep-learning'],
          collections: ['AI', 'Programming'],
          isPinned: false,
          estimatedReadingTime: '55m'
        }
      ]
      
      for (const ex of examples) {
        notebookStorage.add(ex)
      }
      setNotebooks(notebookStorage.getAll())
    }
  }, [])

  const reloadNotebooks = () => {
    setNotebooks(notebookStorage.getAll())
  }

  const handleOpenNotebook = (notebook: any) => {
    notebookStorage.update(notebook.id, { lastOpened: new Date().toISOString() })
    reloadNotebooks()
    window.open(notebook.url, '_blank')
  }

  const handleSaveNotebook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL are required')
      return
    }

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('Please enter a valid URL starting with http:// or https://')
      return
    }

    const payload = {
      name: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category,
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      collections: selectedCollections,
      estimatedReadingTime: readingTime.trim() || '15m',
      lastModified: new Date().toISOString()
    }

    if (isEditMode && selectedNotebookId) {
      notebookStorage.update(selectedNotebookId, payload)
      toast.success('Notebook updated successfully')
    } else {
      notebookStorage.add(payload)
      toast.success('Notebook added to manager')
    }

    reloadNotebooks()
    setIsAddModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedNotebookId(null)
    setTitle('')
    setUrl('')
    setDescription('')
    setCategory('Study')
    setTags('')
    setSelectedCollections(['General'])
    setReadingTime('')
    setIsEditMode(false)
  }

  const handleEditClick = (notebook: any) => {
    setSelectedNotebookId(notebook.id)
    setTitle(notebook.name)
    setUrl(notebook.url)
    setDescription(notebook.description || '')
    setCategory(notebook.category || 'Study')
    setTags(notebook.tags ? notebook.tags.join(', ') : '')
    setSelectedCollections(notebook.collections || ['General'])
    setReadingTime(notebook.estimatedReadingTime || '')
    setIsEditMode(true)
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setNotebookToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (notebookToDelete) {
      notebookStorage.remove(notebookToDelete)
      reloadNotebooks()
      toast.success('Notebook deleted')
    }
    setIsDeleteOpen(false)
    setNotebookToDelete(null)
  }

  const handleTogglePin = (id: string, currentVal: boolean) => {
    notebookStorage.update(id, { isPinned: !currentVal })
    reloadNotebooks()
  }

  const handleToggleFav = (id: string, currentVal: boolean) => {
    notebookStorage.update(id, { isFavourite: !currentVal })
    reloadNotebooks()
  }

  const handleToggleArchive = (id: string, currentVal: boolean) => {
    notebookStorage.update(id, { isArchived: !currentVal })
    reloadNotebooks()
    toast.success(currentVal ? 'Notebook restored' : 'Notebook archived')
  }

  const handleToggleCollection = (colName: string) => {
    setSelectedCollections(prev => 
      prev.includes(colName) 
        ? prev.filter(c => c !== colName) 
        : [...prev, colName]
    )
  }

  // Filter notebooks
  const filteredNotebooks = notebooks.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) || 
                          n.description?.toLowerCase().includes(search.toLowerCase()) ||
                          n.topic?.toLowerCase().includes(search.toLowerCase()) ||
                          n.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
    
    const matchesCollection = activeCollection === 'All' || n.collections?.includes(activeCollection)
    const matchesCategory = activeCategory === 'All' || 
                            (activeCategory === 'Pinned' && n.isPinned) ||
                            (activeCategory === 'Favourites' && n.isFavourite) ||
                            (activeCategory === 'Archived' && n.isArchived) ||
                            (activeCategory === 'Active' && !n.isArchived)
    
    // By default, hide archived unless category is explicitly "Archived"
    const hideArchived = activeCategory !== 'Archived' && n.isArchived
    
    return matchesSearch && matchesCollection && matchesCategory && !hideArchived
  })

  // Sort pinned first
  const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.dateAdded || b.createdAt).getTime() - new Date(a.dateAdded || a.createdAt).getTime()
  })

  return (
    <PageWrapper>
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-[var(--bg-subtle)] to-[var(--bg-subtle)] border-blue-500/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shrink-0">
                <Brain size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text)]">NotebookLM Manager</h1>
                <p className="text-xs text-[var(--text-3)] mt-1 max-w-lg">
                  Organize, tag, and categorize your Google NotebookLM resources. Launch study sources directly in the browser to continue learning.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex gap-2">
              <Button variant="primary" size="sm" onClick={() => window.open('https://notebooklm.google.com', '_blank')}>
                Open NotebookLM <ExternalLink size={12} className="ml-1.5" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { resetForm(); setIsAddModalOpen(true); }} icon={<Plus size={14} />}>
                Add Notebook
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-4)]" />
            <input
              type="text"
              placeholder="Search notebooks, descriptions, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-2xl bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={activeCollection}
              onChange={e => setActiveCollection(e.target.value)}
              options={[{ value: 'All', label: 'All Collections' }, ...collectionsList.map(c => ({ value: c, label: c }))]}
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[var(--border)]">
          {[
            { id: 'Active', label: 'Active Notebooks' },
            { id: 'All', label: 'All' },
            { id: 'Pinned', label: 'Pinned' },
            { id: 'Favourites', label: 'Favourites' },
            { id: 'Archived', label: 'Archived' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]'
                  : 'text-[var(--text-3)] border border-transparent hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Notebooks */}
      {sortedNotebooks.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="No notebooks found"
          description="Create your first study notebook reference to start tracking your sources."
          action={
            <Button variant="primary" size="sm" onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
              Add Notebook
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotebooks.map(notebook => (
            <motion.div
              key={notebook.id}
              layoutId={notebook.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Card hover className="h-full flex flex-col justify-between text-left relative group">
                <div>
                  {/* Actions */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-[var(--text-4)] uppercase tracking-wider bg-[var(--bg-muted)] px-2 py-0.5 rounded">
                      {notebook.category}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleTogglePin(notebook.id, notebook.isPinned)}
                        className={`p-1 rounded hover:bg-[var(--bg-hover)] cursor-pointer ${notebook.isPinned ? 'text-[var(--warning)]' : 'text-[var(--text-4)]'}`}
                      >
                        <Pin size={14} className={notebook.isPinned ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => handleToggleFav(notebook.id, notebook.isFavourite)}
                        className={`p-1 rounded hover:bg-[var(--bg-hover)] cursor-pointer ${notebook.isFavourite ? 'text-red-500' : 'text-[var(--text-4)]'}`}
                      >
                        <Star size={14} className={notebook.isFavourite ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Click */}
                  <button
                    onClick={() => handleOpenNotebook(notebook)}
                    className="text-left font-bold text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-1 block w-full mb-1 cursor-pointer"
                  >
                    {notebook.name}
                  </button>

                  <p className="text-xs text-[var(--text-3)] line-clamp-2 mb-3">
                    {notebook.description || 'No description provided.'}
                  </p>

                  {/* Collections */}
                  {notebook.collections && notebook.collections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {notebook.collections.map((col: string) => (
                        <span key={col} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/5 text-blue-500 border border-blue-500/10">
                          {col}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {notebook.tags && notebook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {notebook.tags.map((tag: string) => (
                        <span key={tag} className="text-[9px] text-[var(--text-3)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-4)] font-medium mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>{notebook.estimatedReadingTime || '15m'} read</span>
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditClick(notebook)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-3)] cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(notebook.id, notebook.isArchived)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-3)] cursor-pointer"
                      title={notebook.isArchived ? 'Restore' : 'Archive'}
                    >
                      <Archive size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(notebook.id)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-red-500 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={isEditMode ? 'Edit Notebook' : 'Add Notebook Reference'}>
        <form onSubmit={handleSaveNotebook} className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Notebook Title</label>
            <Input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Inorganic Chemistry Part I" required />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Notebook URL (Google NotebookLM Link)</label>
            <Input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://notebooklm.google.com/notebook/..." required />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Summary of resources, documents, podcasts attached."
              className="w-full p-3 text-sm border border-[var(--border)] rounded-xl bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Category</label>
              <Select
                value={category}
                onChange={e => setCategory(e.target.value)}
                options={[
                  { value: 'Study', label: 'Study' },
                  { value: 'Physics', label: 'Physics' },
                  { value: 'Chemistry', label: 'Chemistry' },
                  { value: 'Maths', label: 'Maths' },
                  { value: 'Programming', label: 'Programming' },
                  { value: 'AI', label: 'AI' },
                  { value: 'General', label: 'General' }
                ]}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Est. Reading Time</label>
              <Input type="text" value={readingTime} onChange={e => setReadingTime(e.target.value)} placeholder="e.g. 30m" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Tags (comma-separated)</label>
            <Input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="organic, revision, guides" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] mb-1.5 block">Study Collections</label>
            <div className="flex flex-wrap gap-2">
              {collectionsList.map(col => {
                const isSelected = selectedCollections.includes(col)
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleToggleCollection(col)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                        : 'border-[var(--border)] text-[var(--text-3)] bg-transparent hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    {col}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Notebook"
        description="Are you sure you want to remove this Notebook reference? This cannot be undone."
      />
    </PageWrapper>
  )
}

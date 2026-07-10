import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight, Trash2,
  Briefcase, ShoppingCart, Tv, GraduationCap, Activity, Landmark, ShoppingBag
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { financeStorage } from '@/services/storage'
import type { TransactionCategory, TransactionType } from '@/types'

const categoryIcons: Record<string, React.ComponentType<any>> = {
  Income: Briefcase,
  Food: ShoppingCart,
  Entertainment: Tv,
  Education: GraduationCap,
  Health: Activity,
  Savings: Landmark,
  Shopping: ShoppingBag,
}

const DEFAULT_BUDGETS_CONFIG = [
  { category: 'Food', limit: 6000, color: '#16a34a' },
  { category: 'Entertainment', limit: 2000, color: 'var(--accent)' },
  { category: 'Education', limit: 5000, color: '#0284c7' },
  { category: 'Health', limit: 2000, color: '#d97706' },
  { category: 'Shopping', limit: 3000, color: '#dc2626' },
]

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>(() => financeStorage.getTransactions())
  const [activeTab, setActiveTab] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<string | null>(null)

  const reloadTransactions = () => {
    setTransactions(financeStorage.getTransactions())
  }

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount) return

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    financeStorage.addTransaction({
      title: title.trim(),
      category: (type === 'income' ? 'other' : category.toLowerCase()) as TransactionCategory,
      amount: Number(amount),
      type: type as TransactionType,
      date: dateStr,
      tags: [],
    })

    reloadTransactions()
    setIsModalOpen(false)

    // Reset Form
    setTitle('')
    setType('expense')
    setCategory('Food')
    setAmount('')
  }

  const handleDeleteClick = (id: string) => {
    setTxToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (txToDelete) {
      financeStorage.removeTransaction(txToDelete)
      reloadTransactions()
    }
    setIsDeleteOpen(false)
    setTxToDelete(null)
  }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const filtered = activeTab === 'all'
    ? transactions
    : transactions.filter(t => t.type === activeTab)

  // Dynamic budget calculation based on logged expenses
  const budgets = DEFAULT_BUDGETS_CONFIG.map(budget => {
    const totalSpent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((s, t) => s + (t.amount || 0), 0)
    return {
      ...budget,
      spent: totalSpent
    }
  })

  // Format month name
  const monthNameStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <PageWrapper>
      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card className="bg-gradient-to-br from-[var(--bg-subtle)] to-[var(--bg-muted)] border-[var(--border)]">
          <div className="mb-4 text-left">
            <p className="text-xs text-[var(--text-3)] font-semibold uppercase tracking-wider mb-1">Net Balance · {monthNameStr}</p>
            <p className="text-3xl font-black text-[var(--text)]">₹{balance.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-[var(--success)]" />
              <span className="text-xs text-[var(--success)] font-semibold">{savingsRate}% savings rate</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--success-bg)] border border-[var(--success-border)]">
              <ArrowDownRight size={16} className="text-[var(--success)] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-[var(--success)] font-bold uppercase tracking-wider">Income</p>
                <p className="text-sm font-bold text-[var(--text)]">₹{income.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error-border)]">
              <ArrowUpRight size={16} className="text-[var(--error)] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-[var(--error)] font-bold uppercase tracking-wider">Expenses</p>
                <p className="text-sm font-bold text-[var(--text)]">₹{expenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Budget Tracker */}
      <div className="mb-5">
        <SectionHeader title="Budget Tracker" subtitle={monthNameStr} />
        <Card>
          <div className="flex flex-col gap-3">
            {budgets.map(budget => {
              const pct = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0
              const overBudget = pct > 100
              return (
                <div key={budget.category}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--text-3)] font-semibold">{budget.category}</span>
                    <span className={overBudget ? 'text-[var(--error)] font-bold font-mono' : 'text-[var(--text)] font-semibold font-mono'}>
                      ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                      {overBudget && ' ⚠️'}
                    </span>
                  </div>
                  <ProgressBar
                    value={budget.spent}
                    max={budget.limit}
                    color={overBudget ? 'var(--error)' : budget.color}
                    height={5}
                  />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={<Landmark size={24} />}
          title="No financial records"
          description="Log your daily income and expense transactions to see savings rates and manage budgets."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Add your first transaction
            </Button>
          }
        />
      ) : (
        <>
          {/* Transactions */}
          <div className="mb-5">
            {/* Tabs */}
            <div className="flex gap-1 bg-[var(--bg-subtle)] rounded-xl p-1 mb-4 border border-[var(--border)]">
              {[
                { id: 'all', label: 'All' },
                { id: 'income', label: 'Income' },
                { id: 'expense', label: 'Expenses' },
              ].map(tab => (
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

            <SectionHeader title="Transactions" action={
              <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setIsModalOpen(true)}>Add</Button>
            } />
            <div className="flex flex-col gap-2">
              {filtered.map((tx, i) => {
                const TxIcon = categoryIcons[tx.category] || categoryIcons.Income
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card hover>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] flex-shrink-0">
                            <TxIcon size={16} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-[var(--text)] truncate">{tx.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="default" size="sm">{tx.category}</Badge>
                              <span className="text-[10px] text-[var(--text-3)] font-medium">{tx.date}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0 text-right">
                          <div className="flex items-center gap-1">
                            {tx.type === 'income'
                              ? <TrendingUp size={14} className="text-[var(--success)]" />
                              : <TrendingDown size={14} className="text-[var(--error)]" />
                            }
                            <span className={`text-sm font-bold font-mono ${tx.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                              {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(tx.id) }}
                            className="text-[var(--text-4)] hover:text-[var(--error)] p-1 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <FAB onClick={() => setIsModalOpen(true)} label="Add Transaction" extended />

      {/* Add Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
        <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
          <Input
            label="Transaction Title"
            placeholder="e.g. Rent, Freelance Design, Uber ride"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={e => {
                setType(e.target.value)
                if (e.target.value === 'income') setCategory('Income')
              }}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
            />
            {type === 'expense' ? (
              <Select
                label="Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                options={[
                  { value: 'Food', label: 'Food' },
                  { value: 'Entertainment', label: 'Entertainment' },
                  { value: 'Education', label: 'Education' },
                  { value: 'Health', label: 'Health' },
                  { value: 'Shopping', label: 'Shopping' },
                  { value: 'Savings', label: 'Savings' },
                ]}
              />
            ) : (
              <Input
                label="Category"
                value="Income"
                disabled
              />
            )}
          </div>
          <Input
            label="Amount (₹)"
            placeholder="e.g. 1500"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Transaction Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setTxToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description="Are you sure you want to permanently delete this transaction entry?"
      />
    </PageWrapper>
  )
}

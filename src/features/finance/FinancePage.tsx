import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight,
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

interface Transaction {
  id: string
  title: string
  category: string
  amount: number
  type: string
  date: string
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salary', category: 'Income', amount: 45000, type: 'income', date: 'Jul 1' },
  { id: '2', title: 'Grocery Shopping', category: 'Food', amount: 1840, type: 'expense', date: 'Jul 3' },
  { id: '3', title: 'Netflix Subscription', category: 'Entertainment', amount: 649, type: 'expense', date: 'Jul 4' },
  { id: '4', title: 'React Course', category: 'Education', amount: 3200, type: 'expense', date: 'Jul 5' },
  { id: '5', title: 'Freelance Project', category: 'Income', amount: 12000, type: 'income', date: 'Jul 6' },
  { id: '6', title: 'Gym Membership', category: 'Health', amount: 999, type: 'expense', date: 'Jul 6' },
  { id: '7', title: 'Mutual Funds SIP', category: 'Savings', amount: 5000, type: 'expense', date: 'Jul 7' },
]

const DEFAULT_BUDGETS = [
  { category: 'Food', spent: 4200, limit: 6000, color: '#16a34a' },
  { category: 'Entertainment', spent: 1249, limit: 2000, color: 'var(--accent)' },
  { category: 'Education', spent: 3200, limit: 5000, color: '#0284c7' },
  { category: 'Health', spent: 999, limit: 2000, color: '#d97706' },
  { category: 'Shopping', spent: 2800, limit: 3000, color: '#dc2626' },
]

const categoryIcons: Record<string, React.ComponentType<any>> = {
  Income: Briefcase,
  Food: ShoppingCart,
  Entertainment: Tv,
  Education: GraduationCap,
  Health: Activity,
  Savings: Landmark,
  Shopping: ShoppingBag,
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ihsanos_transactions')
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS
  })

  const [activeTab, setActiveTab] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')

  const persistTransactions = (updated: Transaction[]) => {
    setTransactions(updated)
    localStorage.setItem('ihsanos_transactions', JSON.stringify(updated))
  }

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount) return

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const newTx: Transaction = {
      id: Date.now().toString(),
      title: title.trim(),
      category: type === 'income' ? 'Income' : category,
      amount: Number(amount),
      type,
      date: dateStr,
    }

    persistTransactions([newTx, ...transactions])
    setIsModalOpen(false)

    // Reset Form
    setTitle('')
    setType('expense')
    setCategory('Food')
    setAmount('')
  }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const filtered = activeTab === 'all'
    ? transactions
    : transactions.filter(t => t.type === activeTab)

  // Dynamic budget calculation based on logged expenses
  const budgets = DEFAULT_BUDGETS.map(budget => {
    const totalSpent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((s, t) => s + t.amount, 0)
    return {
      ...budget,
      spent: totalSpent
    }
  })

  return (
    <PageWrapper>
      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card className="bg-gradient-to-br from-[var(--bg-subtle)] to-[var(--bg-muted)] border-[var(--border)]">
          <div className="mb-4">
            <p className="text-xs text-[var(--text-3)] font-semibold uppercase tracking-wider mb-1">Net Balance · July 2026</p>
            <p className="text-3xl font-black text-[var(--text)]">₹{balance.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-[var(--success)]" />
              <span className="text-xs text-[var(--success)] font-semibold">{savingsRate}% savings rate</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--success-bg)] border border-[var(--success-border)]">
              <ArrowDownRight size={16} className="text-[var(--success)] shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--success)] font-bold uppercase tracking-wider">Income</p>
                <p className="text-sm font-bold text-[var(--text)]">₹{income.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error-border)]">
              <ArrowUpRight size={16} className="text-[var(--error)] shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--error)] font-bold uppercase tracking-wider">Expenses</p>
                <p className="text-sm font-bold text-[var(--text)]">₹{expenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Budget Tracker */}
      <div className="mb-5">
        <SectionHeader title="Budget Tracker" subtitle="July 2026" />
        <Card>
          <div className="flex flex-col gap-3">
            {budgets.map(budget => {
              const pct = Math.round((budget.spent / budget.limit) * 100)
              const overBudget = pct > 100
              return (
                <div key={budget.category}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--text-3)] font-semibold">{budget.category}</span>
                    <span className={overBudget ? 'text-[var(--error)] font-bold' : 'text-[var(--text)] font-semibold'}>
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
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] flex-shrink-0">
                      <TxIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{tx.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="default" size="sm">{tx.category}</Badge>
                        <span className="text-[10px] text-[var(--text-3)] font-medium">{tx.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {tx.type === 'income'
                        ? <TrendingUp size={14} className="text-[var(--success)]" />
                        : <TrendingDown size={14} className="text-[var(--error)]" />
                      }
                      <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

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
    </PageWrapper>
  )
}

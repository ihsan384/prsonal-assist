import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'

const transactions = [
  { id: '1', title: 'Salary', category: 'Income', amount: 45000, type: 'income', date: 'Jul 1', emoji: '💼' },
  { id: '2', title: 'Grocery Shopping', category: 'Food', amount: 1840, type: 'expense', date: 'Jul 3', emoji: '🛒' },
  { id: '3', title: 'Netflix Subscription', category: 'Entertainment', amount: 649, type: 'expense', date: 'Jul 4', emoji: '📺' },
  { id: '4', title: 'React Course', category: 'Education', amount: 3200, type: 'expense', date: 'Jul 5', emoji: '💻' },
  { id: '5', title: 'Freelance Project', category: 'Income', amount: 12000, type: 'income', date: 'Jul 6', emoji: '🎨' },
  { id: '6', title: 'Gym Membership', category: 'Health', amount: 999, type: 'expense', date: 'Jul 6', emoji: '🏋️' },
  { id: '7', title: 'Mutual Funds SIP', category: 'Savings', amount: 5000, type: 'expense', date: 'Jul 7', emoji: '📈' },
]

const budgets = [
  { category: 'Food', spent: 4200, limit: 6000, color: '#10b981' },
  { category: 'Entertainment', spent: 1249, limit: 2000, color: '#7c6aff' },
  { category: 'Education', spent: 3200, limit: 5000, color: '#06b6d4' },
  { category: 'Health', spent: 999, limit: 2000, color: '#f59e0b' },
  { category: 'Shopping', spent: 2800, limit: 3000, color: '#f43f5e' },
]

const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
const balance = income - expenses
const savingsRate = Math.round((balance / income) * 100)

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? transactions
    : transactions.filter(t => t.type === activeTab)

  return (
    <PageWrapper>
      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card className="bg-gradient-to-br from-[#111118] to-[#13131e]">
          <div className="mb-4">
            <p className="text-xs text-[#55556a] mb-1">Net Balance · July 2026</p>
            <p className="text-3xl font-bold text-[#f0f0f5]">₹{balance.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-[#10b981]" />
              <span className="text-xs text-[#10b981]">{savingsRate}% savings rate</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(16,185,129,0.1)]">
              <ArrowDownRight size={16} className="text-[#10b981]" />
              <div>
                <p className="text-[10px] text-[#10b981]">Income</p>
                <p className="text-sm font-bold text-[#f0f0f5]">₹{income.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(244,63,94,0.1)]">
              <ArrowUpRight size={16} className="text-[#f43f5e]" />
              <div>
                <p className="text-[10px] text-[#f43f5e]">Expenses</p>
                <p className="text-sm font-bold text-[#f0f0f5]">₹{expenses.toLocaleString()}</p>
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
                    <span className="text-[#8888a0]">{budget.category}</span>
                    <span className={overBudget ? 'text-[#f43f5e] font-semibold' : 'text-[#f0f0f5]'}>
                      ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                      {overBudget && ' ⚠️'}
                    </span>
                  </div>
                  <ProgressBar
                    value={budget.spent}
                    max={budget.limit}
                    color={overBudget ? '#f43f5e' : budget.color}
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
        <div className="flex gap-1 bg-[#111118] rounded-xl p-1 mb-4 border border-[rgba(255,255,255,0.06)]">
          {[
            { id: 'all', label: 'All' },
            { id: 'income', label: 'Income' },
            { id: 'expense', label: 'Expenses' },
          ].map(tab => (
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

        <SectionHeader title="Transactions" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Add</Button>
        } />
        <div className="flex flex-col gap-2">
          {filtered.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card hover>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tx.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f0f0f5] truncate">{tx.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="default" size="sm">{tx.category}</Badge>
                      <span className="text-[10px] text-[#55556a]">{tx.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {tx.type === 'income'
                      ? <TrendingUp size={14} className="text-[#10b981]" />
                      : <TrendingDown size={14} className="text-[#f43f5e]" />
                    }
                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <FAB onClick={() => {}} />
    </PageWrapper>
  )
}

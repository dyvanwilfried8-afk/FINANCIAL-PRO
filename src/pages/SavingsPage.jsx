import { useState } from 'react'
import { SAVINGS_ACCOUNTS, SAVINGS_CATEGORIES, calculateAnnualInterest } from '../lib/savingsRates'
import { formatCurrency, formatPercent } from '../lib/utils'
import { PiggyBank, Info, Plus, Minus, TrendingUp } from 'lucide-react'

export default function SavingsPage() {
  const [amounts, setAmounts] = useState({})
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('rate')

  const filteredAccounts = SAVINGS_ACCOUNTS
    .filter(a => filter === 'all' || a.category === filter)
    .sort((a, b) => sortBy === 'rate' ? b.rate - a.rate : a.name.localeCompare(b.name))

  const totalDeposited = Object.values(amounts).reduce((s, v) => s + (Number(v) || 0), 0)
  const totalAnnualInterest = SAVINGS_ACCOUNTS.reduce((s, acc) => {
    const amount = Number(amounts[acc.id]) || 0
    return s + calculateAnnualInterest(amount, acc.rate)
  }, 0)

  const handleAmount = (id, val) => {
    setAmounts(prev => ({ ...prev, [id]: val }))
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">Épargne</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          Taux réels des livrets bancaires français — mis à jour automatiquement
        </p>
      </div>

      {/* Summary cards */}
      {totalDeposited > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-surface-1 border border-surface-3 rounded-2xl p-5">
            <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-2">
              Total épargné
            </div>
            <div className="text-2xl font-display font-bold text-text-primary">
              {formatCurrency(totalDeposited)}
            </div>
          </div>
          <div className="bg-accent-green/5 border border-accent-green/20 rounded-2xl p-5">
            <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-2">
              Intérêts annuels estimés
            </div>
            <div className="text-2xl font-display font-bold text-accent-green">
              {formatCurrency(totalAnnualInterest)}
            </div>
          </div>
          <div className="bg-surface-1 border border-surface-3 rounded-2xl p-5">
            <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-2">
              Taux moyen pondéré
            </div>
            <div className="text-2xl font-display font-bold text-text-primary">
              {totalDeposited > 0 ? formatPercent((totalAnnualInterest / totalDeposited) * 100, false) : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-surface-2 rounded-xl p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
              filter === 'all' ? 'bg-surface-4 text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Tous
          </button>
          {Object.entries(SAVINGS_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                filter === key ? 'bg-surface-4 text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-text-muted font-body">
          Trier par:
          <button
            onClick={() => setSortBy('rate')}
            className={`px-2.5 py-1 rounded-lg transition-all ${sortBy === 'rate' ? 'text-accent-green' : 'hover:text-text-secondary'}`}
          >
            Taux ↓
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2.5 py-1 rounded-lg transition-all ${sortBy === 'name' ? 'text-accent-green' : 'hover:text-text-secondary'}`}
          >
            Nom A→Z
          </button>
        </div>
      </div>

      {/* Rate notice */}
      <div className="flex items-center gap-2 bg-accent-blue/5 border border-accent-blue/15 rounded-xl px-4 py-3 text-xs font-body text-accent-blue">
        <Info size={13} className="flex-shrink-0" />
        Taux nets pour les livrets réglementés, bruts (avant flat tax 30%) pour les livrets bancaires.
        Mis à jour le 1er février 2025 — prochaine révision prévue août 2025.
      </div>

      {/* Accounts grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map(acc => {
          const amount = Number(amounts[acc.id]) || 0
          const annualInterest = calculateAnnualInterest(amount, acc.rate)
          const monthlyInterest = annualInterest / 12

          return (
            <div
              key={acc.id}
              className="bg-surface-1 border border-surface-3 rounded-2xl p-5 hover:border-surface-4 transition-all duration-200 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{acc.icon}</span>
                    <span className="font-display font-semibold text-text-primary text-sm">{acc.name}</span>
                    {acc.taxFree && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-accent-green/10 text-accent-green font-display font-medium">
                        Net
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted font-body">{acc.institution}</div>
                </div>
                <div className="text-right">
                  <div
                    className="text-xl font-display font-bold"
                    style={{ color: acc.rate >= 3 ? '#00E5A0' : acc.rate >= 2 ? '#4D9EFF' : '#8B92A5' }}
                  >
                    {acc.rate}%
                  </div>
                  <div className="text-xs text-text-muted font-body">annuel</div>
                </div>
              </div>

              {/* Max amount */}
              {acc.maxAmount && (
                <div className="text-xs font-body text-text-muted">
                  Plafond : <span className="text-text-secondary font-mono">{formatCurrency(acc.maxAmount, 'EUR', true)}</span>
                </div>
              )}

              {/* Amount input */}
              <div>
                <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
                  Mon épargne
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAmount(acc.id, Math.max(0, amount - 1000))}
                    className="w-8 h-8 rounded-lg bg-surface-2 border border-surface-3 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={acc.maxAmount || 9999999}
                    value={amounts[acc.id] || ''}
                    onChange={e => handleAmount(acc.id, e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-surface-2 border border-surface-3 rounded-xl px-3 py-2 text-text-primary text-sm font-mono text-center focus:outline-none focus:border-accent-green/50 transition-all"
                  />
                  <button
                    onClick={() => handleAmount(acc.id, amount + 1000)}
                    className="w-8 h-8 rounded-lg bg-surface-2 border border-surface-3 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Interest preview */}
              {amount > 0 && (
                <div className="bg-accent-green/5 border border-accent-green/10 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-accent-green text-xs mb-1">
                    <TrendingUp size={11} />
                    <span className="font-display font-medium">Simulation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-text-muted font-body">Mensuel</div>
                      <div className="font-mono font-semibold text-text-primary">
                        +{formatCurrency(monthlyInterest)}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-muted font-body">Annuel</div>
                      <div className="font-mono font-semibold text-accent-green">
                        +{formatCurrency(annualInterest)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-text-muted font-body leading-relaxed">{acc.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

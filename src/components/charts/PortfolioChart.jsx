import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency, formatDateShort, gainColor } from '../../lib/utils'
import { subDays, subMonths, startOfYear, parseISO, isAfter } from 'date-fns'

const PERIODS = [
  { key: '1D', label: '1J', days: 1 },
  { key: '7D', label: '7J', days: 7 },
  { key: '1M', label: '1M', months: 1 },
  { key: '3M', label: '3M', months: 3 },
  { key: '6M', label: '6M', months: 6 },
  { key: 'YTD', label: 'YTD', ytd: true },
  { key: 'ALL', label: 'Tout', all: true },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 shadow-xl">
      <div className="text-text-muted text-xs mb-1 font-body">{label}</div>
      <div className="text-text-primary font-mono font-semibold text-sm">
        {formatCurrency(payload[0]?.value)}
      </div>
    </div>
  )
}

export default function PortfolioChart({ snapshots }) {
  const [period, setPeriod] = useState('1M')

  const filtered = useMemo(() => {
    if (!snapshots?.length) return []
    const now = new Date()
    const p = PERIODS.find(x => x.key === period)
    let cutoff

    if (p?.all) cutoff = new Date(0)
    else if (p?.ytd) cutoff = startOfYear(now)
    else if (p?.months) cutoff = subMonths(now, p.months)
    else cutoff = subDays(now, p?.days || 30)

    return snapshots
      .filter(s => isAfter(parseISO(s.date), cutoff))
      .map(s => ({
        date: formatDateShort(s.date),
        value: s.total_value,
      }))
  }, [snapshots, period])

  const gain = filtered.length >= 2
    ? filtered[filtered.length - 1].value - filtered[0].value
    : 0
  const color = gainColor(gain)

  // Generate demo data if empty
  const chartData = filtered.length > 1 ? filtered : generateDemoData()

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-1">
            Évolution du patrimoine
          </div>
          {gain !== 0 && (
            <div
              className="text-sm font-mono font-semibold"
              style={{ color }}
            >
              {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
            </div>
          )}
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-surface-2 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 ${
                period === p.key
                  ? 'bg-surface-4 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#22262F" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#4A5168', fontSize: 10, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#4A5168', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#chartGrad)"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function generateDemoData() {
  const data = []
  let value = 45000
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = subDays(now, i)
    value = value * (1 + (Math.random() - 0.42) * 0.015)
    data.push({
      date: formatDateShort(date.toISOString()),
      value: Math.round(value),
    })
  }
  return data
}

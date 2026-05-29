import { formatCurrency, formatPercent, gainColor } from '../../lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ label, value, change, changePct, currency = 'EUR', subtitle, accent }) {
  const positive = (change ?? changePct ?? 0) >= 0
  const color = gainColor(change ?? changePct ?? 0)

  return (
    <div className={`bg-surface-1 border rounded-2xl p-5 transition-all hover:border-surface-4 ${
      accent ? 'border-accent-green/20 bg-accent-green/5' : 'border-surface-3'
    }`}>
      <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-3">
        {label}
      </div>

      <div className={`text-2xl font-display font-bold mb-1 ${accent ? 'text-accent-green' : 'text-text-primary'}`}>
        {formatCurrency(value, currency, true)}
      </div>

      {(change !== undefined || changePct !== undefined) && (
        <div className="flex items-center gap-2 mt-2">
          <div
            className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}18` }}
          >
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {changePct !== undefined && <span>{formatPercent(changePct)}</span>}
          </div>
          {change !== undefined && (
            <span className="text-xs font-mono" style={{ color }}>
              {change >= 0 ? '+' : ''}{formatCurrency(change, currency)}
            </span>
          )}
        </div>
      )}

      {subtitle && (
        <div className="text-xs text-text-muted mt-2 font-body">{subtitle}</div>
      )}
    </div>
  )
}

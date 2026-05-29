import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ASSET_TYPE_COLORS, ASSET_TYPES, formatCurrency } from '../../lib/utils'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-surface-2 border border-surface-4 rounded-xl px-3 py-2 shadow-xl text-sm">
      <div className="font-display font-semibold text-text-primary">{d.name}</div>
      <div className="font-mono text-text-secondary">{formatCurrency(d.value)}</div>
      <div className="text-text-muted text-xs">{d.pct.toFixed(1)}%</div>
    </div>
  )
}

export default function AllocationChart({ byType }) {
  const total = Object.values(byType).reduce((s, t) => s + t.value, 0)
  const data = Object.entries(byType).map(([type, { value }]) => ({
    name: ASSET_TYPES[type] || type,
    value,
    color: ASSET_TYPE_COLORS[type] || '#8B92A5',
    pct: total > 0 ? (value / total) * 100 : 0,
  })).sort((a, b) => b.value - a.value)

  if (!data.length) return (
    <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 flex items-center justify-center h-48">
      <p className="text-text-muted text-sm font-body">Aucun actif pour l'instant</p>
    </div>
  )

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6">
      <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-5">
        Allocation
      </div>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="flex-shrink-0 w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-body text-text-secondary">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-muted">{d.pct.toFixed(0)}%</span>
                <span className="text-xs font-mono text-text-primary">{formatCurrency(d.value, 'EUR', true)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

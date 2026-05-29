import { usePortfolio } from '../hooks/usePortfolio'
import StatCard from '../components/dashboard/StatCard'
import PortfolioChart from '../components/charts/PortfolioChart'
import AllocationChart from '../components/charts/AllocationChart'
import { formatCurrency, ASSET_TYPES, ASSET_TYPE_COLORS, gainColor } from '../lib/utils'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const {
    assets, snapshots, loading,
    totalValue, totalInvested, totalGain, totalGainPct,
    byType, refresh
  } = usePortfolio()

  if (loading) return <LoadingState />

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">
            Patrimoine
          </h1>
          <p className="text-text-secondary text-sm font-body mt-1">
            Vue d'ensemble de vos actifs
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2.5 rounded-xl bg-surface-2 border border-surface-3 text-text-secondary hover:text-text-primary hover:border-surface-4 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Main value */}
      <div className="bg-gradient-to-br from-surface-1 to-surface-2 border border-surface-3 rounded-2xl p-8">
        <div className="text-text-muted text-xs font-display uppercase tracking-widest mb-3">
          Valeur totale du patrimoine
        </div>
        <div className="text-5xl font-display font-bold text-text-primary tracking-tight mb-4">
          {formatCurrency(totalValue)}
        </div>
        {totalGain !== 0 && (
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 text-sm font-mono px-3 py-1.5 rounded-full border"
              style={{
                color: gainColor(totalGain),
                backgroundColor: `${gainColor(totalGain)}15`,
                borderColor: `${gainColor(totalGain)}30`,
              }}
            >
              {totalGain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}</span>
              <span className="opacity-70">({totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}%)</span>
            </div>
            <span className="text-text-muted text-sm font-body">
              vs. coût d'achat {formatCurrency(totalInvested)}
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Investi" value={totalInvested} />
        <StatCard label="Plus-values" value={totalGain} change={totalGain} changePct={totalGainPct} accent={totalGain >= 0} />
        <StatCard label="Nombre d'actifs" value={assets.length} subtitle={`${Object.keys(byType).length} catégorie(s)`} />
        <StatCard label="Performance" value={null} changePct={totalGainPct} subtitle="Depuis le premier achat" />
      </div>

      {/* Chart + Allocation */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart snapshots={snapshots} />
        </div>
        <AllocationChart byType={byType} />
      </div>

      {/* Asset list */}
      {assets.length > 0 && (
        <div className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-3">
            <h2 className="font-display font-semibold text-text-primary">Mes actifs</h2>
          </div>
          <div className="divide-y divide-surface-3">
            {assets.map(asset => {
              const gain = (asset.current_value || 0) - ((asset.buy_price || 0) * (asset.quantity || 1))
              const gainPct = asset.buy_price > 0
                ? (gain / (asset.buy_price * asset.quantity)) * 100
                : 0
              return (
                <div key={asset.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ASSET_TYPE_COLORS[asset.asset_type] || '#8B92A5' }}
                    />
                    <div>
                      <div className="font-display font-medium text-text-primary text-sm">{asset.name}</div>
                      <div className="text-xs text-text-muted font-mono">
                        {asset.ticker && <span className="mr-2">{asset.ticker}</span>}
                        <span>{ASSET_TYPES[asset.asset_type] || asset.asset_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-text-primary text-sm">
                      {formatCurrency(asset.current_value)}
                    </div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: gainColor(gain) }}
                    >
                      {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {assets.length === 0 && (
        <EmptyState />
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-surface-2 rounded-xl" />
      <div className="h-40 bg-surface-2 rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-2 rounded-2xl" />)}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-surface-1 border border-surface-3 border-dashed rounded-2xl p-12 text-center">
      <div className="text-4xl mb-4">📊</div>
      <h3 className="font-display font-semibold text-text-primary mb-2">Aucun actif pour l'instant</h3>
      <p className="text-text-secondary text-sm font-body mb-6 max-w-sm mx-auto">
        Importez un fichier CSV, connectez une API ou ajoutez vos actifs manuellement pour commencer.
      </p>
    </div>
  )
}

import { useState } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import {
  formatCurrency, formatPercent, gainColor,
  ASSET_TYPES, ASSET_TYPE_COLORS
} from '../lib/utils'
import { Plus, Trash2, Pencil, X, Check, TrendingUp, TrendingDown } from 'lucide-react'

const EMPTY_ASSET = {
  name: '', ticker: '', asset_type: 'stock',
  quantity: 1, buy_price: 0, current_value: 0, currency: 'EUR'
}

export default function AssetsPage() {
  const { assets, loading, addAsset, updateAsset, deleteAsset } = usePortfolio()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_ASSET)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const handleSubmit = async () => {
    setSaving(true)
    if (editId) {
      await updateAsset(editId, form)
    } else {
      await addAsset(form)
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_ASSET)
  }

  const startEdit = (asset) => {
    setForm({
      name: asset.name, ticker: asset.ticker || '', asset_type: asset.asset_type,
      quantity: asset.quantity, buy_price: asset.buy_price,
      current_value: asset.current_value, currency: asset.currency || 'EUR'
    })
    setEditId(asset.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    await deleteAsset(id)
    setDeleting(null)
  }

  if (loading) return <div className="p-8 text-text-secondary font-body animate-pulse">Chargement…</div>

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">Mes actifs</h1>
          <p className="text-text-secondary text-sm font-body mt-1">{assets.length} actif(s) dans votre portefeuille</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_ASSET) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all"
        >
          <Plus size={16} />
          Ajouter un actif
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-surface-1 border border-accent-green/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-text-primary">
              {editId ? 'Modifier l\'actif' : 'Nouvel actif'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditId(null) }}
              className="text-text-muted hover:text-text-secondary"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Apple Inc" />
            <Field label="Ticker / Symbole" value={form.ticker} onChange={v => setForm(f => ({ ...f, ticker: v }))} placeholder="AAPL" />

            <div>
              <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
                Type d'actif
              </label>
              <select
                value={form.asset_type}
                onChange={e => setForm(f => ({ ...f, asset_type: e.target.value }))}
                className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:outline-none focus:border-accent-green/50 transition-all"
              >
                {Object.entries(ASSET_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <Field label="Devise" value={form.currency} onChange={v => setForm(f => ({ ...f, currency: v }))} placeholder="EUR" />
            <Field label="Quantité" type="number" value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: parseFloat(v) || 0 }))} />
            <Field label="Prix d'achat unitaire (€)" type="number" value={form.buy_price} onChange={v => setForm(f => ({ ...f, buy_price: parseFloat(v) || 0 }))} />
            <Field label="Valeur actuelle totale (€)" type="number" value={form.current_value} onChange={v => setForm(f => ({ ...f, current_value: parseFloat(v) || 0 }))} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 py-2 text-sm font-display font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name || saving}
              className="flex items-center gap-2 px-5 py-2 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50"
            >
              {saving ? <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" /> : <Check size={14} />}
              {editId ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {assets.length > 0 ? (
        <div className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-surface-3">
              <tr>
                {['Actif', 'Type', 'Quantité', 'Coût total', 'Valeur', 'P&L', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-display font-medium text-text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {assets.map(asset => {
                const cost = (asset.buy_price || 0) * (asset.quantity || 1)
                const gain = (asset.current_value || 0) - cost
                const gainPct = cost > 0 ? (gain / cost) * 100 : 0
                const color = gainColor(gain)

                return (
                  <tr key={asset.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-1.5 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ASSET_TYPE_COLORS[asset.asset_type] || '#8B92A5' }}
                        />
                        <div>
                          <div className="font-display font-medium text-text-primary text-sm">{asset.name}</div>
                          {asset.ticker && <div className="text-xs font-mono text-text-muted">{asset.ticker}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-body text-text-secondary">
                      {ASSET_TYPES[asset.asset_type] || asset.asset_type}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-text-secondary">{asset.quantity}</td>
                    <td className="px-5 py-4 font-mono text-sm text-text-secondary">{formatCurrency(cost)}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-sm text-text-primary">{formatCurrency(asset.current_value)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5" style={{ color }}>
                        {gain >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        <span className="font-mono text-xs font-semibold">{formatPercent(gainPct)}</span>
                        <span className="font-mono text-xs opacity-70">({gain >= 0 ? '+' : ''}{formatCurrency(gain)})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(asset)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          disabled={deleting === asset.id}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-surface-1 border border-surface-3 border-dashed rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="font-display font-semibold text-text-primary mb-2">Aucun actif</h3>
          <p className="text-text-secondary text-sm font-body">
            Ajoutez un actif manuellement ou importez un CSV.
          </p>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-body focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
      />
    </div>
  )
}

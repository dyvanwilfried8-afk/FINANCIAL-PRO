import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePortfolio() {
  const { user } = useAuth()
  const [assets, setAssets] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAssets = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setAssets(data || [])
    setLoading(false)
  }, [user])

  const fetchSnapshots = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) setError(error.message)
    else setSnapshots(data || [])
  }, [user])

  useEffect(() => {
    fetchAssets()
    fetchSnapshots()
  }, [fetchAssets, fetchSnapshots])

  const addAsset = async (asset) => {
    const { data, error } = await supabase
      .from('assets')
      .insert([{ ...asset, user_id: user.id }])
      .select()
      .single()

    if (error) return { error }
    setAssets(prev => [data, ...prev])
    await saveSnapshot()
    return { data }
  }

  const updateAsset = async (id, updates) => {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return { error }
    setAssets(prev => prev.map(a => a.id === id ? data : a))
    return { data }
  }

  const deleteAsset = async (id) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error }
    setAssets(prev => prev.filter(a => a.id !== id))
    return { error: null }
  }

  const saveSnapshot = async () => {
    const total = assets.reduce((sum, a) => sum + (a.current_value || 0), 0)
    const today = new Date().toISOString().split('T')[0]

    await supabase.from('portfolio_snapshots').upsert({
      user_id: user.id,
      date: today,
      total_value: total,
    }, { onConflict: 'user_id,date' })

    await fetchSnapshots()
  }

  const importFromCSV = async (rows) => {
    const toInsert = rows.map(r => ({
      user_id: user.id,
      name: r.name || r.Name || 'Inconnu',
      ticker: r.ticker || r.Ticker || r.symbol || '',
      asset_type: r.type || r.Type || r.asset_type || 'other',
      quantity: parseFloat(r.quantity || r.Quantity || 1),
      buy_price: parseFloat(r.buy_price || r.price || r.Price || 0),
      current_value: parseFloat(r.current_value || r.value || r.Value || 0),
      currency: r.currency || r.Currency || 'EUR',
    }))

    const { data, error } = await supabase
      .from('assets')
      .insert(toInsert)
      .select()

    if (error) return { error }
    setAssets(prev => [...data, ...prev])
    return { data }
  }

  // Calculs agrégés
  const totalValue = assets.reduce((sum, a) => sum + (a.current_value || 0), 0)
  const totalInvested = assets.reduce((sum, a) => sum + ((a.buy_price || 0) * (a.quantity || 1)), 0)
  const totalGain = totalValue - totalInvested
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

  const byType = assets.reduce((acc, a) => {
    const t = a.asset_type || 'other'
    if (!acc[t]) acc[t] = { value: 0, count: 0 }
    acc[t].value += a.current_value || 0
    acc[t].count++
    return acc
  }, {})

  return {
    assets, snapshots, loading, error,
    totalValue, totalInvested, totalGain, totalGainPct, byType,
    addAsset, updateAsset, deleteAsset, importFromCSV,
    refresh: () => { fetchAssets(); fetchSnapshots() }
  }
}

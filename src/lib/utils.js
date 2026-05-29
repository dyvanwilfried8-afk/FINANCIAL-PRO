// Format currency
export const formatCurrency = (value, currency = 'EUR', compact = false) => {
  if (value === null || value === undefined) return '—'
  const opts = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
  if (compact && Math.abs(value) >= 1000) {
    opts.notation = 'compact'
    opts.maximumFractionDigits = 1
  }
  return new Intl.NumberFormat('fr-FR', opts).format(value)
}

// Format percentage
export const formatPercent = (value, signed = true) => {
  if (value === null || value === undefined) return '—'
  const sign = signed && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// Format date
export const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(dateStr))
}

// Format short date for chart axis
export const formatDateShort = (dateStr) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short'
  }).format(new Date(dateStr))
}

// Get color from value
export const gainColor = (value) => {
  if (value > 0) return '#00E5A0'
  if (value < 0) return '#FF4D6A'
  return '#8B92A5'
}

// Asset type labels
export const ASSET_TYPES = {
  stock: 'Actions',
  crypto: 'Crypto',
  etf: 'ETF',
  real_estate: 'Immobilier',
  savings: 'Épargne',
  other: 'Autre',
}

export const ASSET_TYPE_COLORS = {
  stock: '#4D9EFF',
  crypto: '#FFB547',
  etf: '#00E5A0',
  real_estate: '#A78BFA',
  savings: '#34D399',
  other: '#8B92A5',
}

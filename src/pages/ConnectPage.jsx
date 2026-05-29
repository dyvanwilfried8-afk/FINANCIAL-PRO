import { useState } from 'react'
import { Link2, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

const CONNECTIONS = [
  {
    id: 'binance',
    name: 'Binance',
    icon: '🟡',
    category: 'crypto',
    description: 'Synchronisez automatiquement votre portefeuille crypto Binance.',
    status: 'available',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Votre clé API Binance' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Votre clé secrète' },
    ],
    hint: 'Créez une clé API en lecture seule dans Paramètres → Gestion des API',
    docsUrl: 'https://www.binance.com/en/support/faq/how-to-create-api-keys-on-binance-360002502072',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: '🔵',
    category: 'crypto',
    description: 'Importez vos cryptomonnaies Coinbase.',
    status: 'available',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Votre clé API Coinbase' },
      { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Votre secret API' },
    ],
    hint: 'Activez l\'accès lecture seule dans Paramètres → Sécurité → Clés API',
    docsUrl: 'https://help.coinbase.com/en/exchange/managing-my-account/how-to-create-an-api-key',
  },
  {
    id: 'excel_online',
    name: 'Excel Online',
    icon: '📊',
    category: 'spreadsheet',
    description: 'Synchronisez depuis un classeur Excel Online partagé via Microsoft Graph.',
    status: 'available',
    fields: [
      { key: 'workbookUrl', label: 'URL du classeur', type: 'url', placeholder: 'https://onedrive.live.com/...' },
      { key: 'sheet', label: 'Nom de la feuille', type: 'text', placeholder: 'Feuil1' },
    ],
    hint: 'Partagez votre classeur OneDrive et copiez l\'URL de partage',
    docsUrl: 'https://docs.microsoft.com/en-us/graph/api/resources/excel',
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    icon: '📋',
    category: 'spreadsheet',
    description: 'Importez depuis Google Sheets via export CSV public.',
    status: 'available',
    fields: [
      { key: 'sheetId', label: 'ID du document', type: 'text', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms' },
      { key: 'gid', label: 'ID de la feuille (gid)', type: 'text', placeholder: '0' },
    ],
    hint: 'Rendez votre feuille publique (Partager → Toute personne ayant le lien)',
    docsUrl: '',
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    icon: '📈',
    category: 'brokerage',
    description: 'Connectez votre compte Trading 212 via leur API officielle.',
    status: 'beta',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Généré depuis votre compte T212' },
    ],
    hint: 'Trouvez votre clé dans Paramètres → API',
    docsUrl: 'https://t212public-api-docs.redoc.ly/',
  },
  {
    id: 'degiro',
    name: 'DEGIRO',
    icon: '🏦',
    category: 'brokerage',
    description: 'Importez votre portefeuille DEGIRO (CSV export).',
    status: 'csv',
    fields: [],
    hint: 'DEGIRO ne propose pas d\'API publique. Utilisez l\'export CSV depuis votre compte.',
    docsUrl: '',
  },
]

const CATEGORY_LABELS = {
  crypto: 'Crypto',
  spreadsheet: 'Tableurs',
  brokerage: 'Courtiers',
}

export default function ConnectPage() {
  const [connected, setConnected] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [fields, setFields] = useState({})
  const [loading, setLoading] = useState(null)

  const handleConnect = async (connId) => {
    setLoading(connId)
    await new Promise(r => setTimeout(r, 1500))
    setConnected(prev => ({ ...prev, [connId]: { status: 'connected', connectedAt: new Date() } }))
    setExpanded(null)
    setLoading(null)
  }

  const handleDisconnect = (connId) => {
    setConnected(prev => {
      const next = { ...prev }
      delete next[connId]
      return next
    })
  }

  const categories = [...new Set(CONNECTIONS.map(c => c.category))]

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">Connexions API</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          Synchronisez automatiquement vos actifs depuis vos plateformes préférées
        </p>
      </div>

      {Object.keys(connected).length > 0 && (
        <div className="flex items-center gap-2 bg-accent-green/5 border border-accent-green/15 rounded-xl px-4 py-3 text-sm font-body text-accent-green">
          <CheckCircle size={14} />
          {Object.keys(connected).length} connexion(s) active(s) — synchronisation toutes les heures
        </div>
      )}

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="font-display font-semibold text-text-secondary text-xs uppercase tracking-widest mb-4">
            {CATEGORY_LABELS[cat] || cat}
          </h2>
          <div className="space-y-3">
            {CONNECTIONS.filter(c => c.category === cat).map(conn => {
              const isConnected = !!connected[conn.id]
              const isExpanded = expanded === conn.id

              return (
                <div
                  key={conn.id}
                  className={`bg-surface-1 border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isConnected ? 'border-accent-green/25' : 'border-surface-3'
                  }`}
                >
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{conn.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-text-primary">{conn.name}</span>
                          {conn.status === 'beta' && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-accent-gold/15 text-accent-gold font-display font-medium">
                              Bêta
                            </span>
                          )}
                          {conn.status === 'csv' && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-surface-3 text-text-muted font-display font-medium">
                              CSV uniquement
                            </span>
                          )}
                        </div>
                        <div className="text-text-muted text-xs font-body mt-0.5">{conn.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isConnected && (
                        <div className="flex items-center gap-1.5 text-xs text-accent-green font-mono">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
                          Connecté
                        </div>
                      )}
                      {isConnected ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {}}
                            className="p-2 rounded-lg text-text-muted hover:text-accent-green hover:bg-accent-green/10 transition-all"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => handleDisconnect(conn.id)}
                            className="px-3 py-1.5 text-xs font-display font-medium text-accent-red border border-accent-red/20 rounded-lg hover:bg-accent-red/10 transition-all"
                          >
                            Déconnecter
                          </button>
                        </div>
                      ) : conn.status !== 'csv' && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : conn.id)}
                          className="px-4 py-2 bg-surface-3 border border-surface-4 rounded-xl text-sm font-display font-medium text-text-secondary hover:text-text-primary hover:border-accent-green/30 transition-all"
                        >
                          {isExpanded ? 'Fermer' : 'Connecter'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded config */}
                  {isExpanded && conn.fields.length > 0 && (
                    <div className="border-t border-surface-3 px-6 py-5 bg-surface-2/50 space-y-4">
                      {conn.fields.map(field => (
                        <div key={field.key}>
                          <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            value={fields[`${conn.id}.${field.key}`] || ''}
                            onChange={e => setFields(prev => ({
                              ...prev, [`${conn.id}.${field.key}`]: e.target.value
                            }))}
                            placeholder={field.placeholder}
                            className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent-green/50 transition-all"
                          />
                        </div>
                      ))}

                      {conn.hint && (
                        <div className="flex items-start gap-2 text-xs font-body text-text-muted bg-surface-2 border border-surface-3 rounded-xl px-4 py-3">
                          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                          <span>{conn.hint}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        {conn.docsUrl && (
                          <a
                            href={conn.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-accent-blue hover:underline font-body"
                          >
                            Documentation <ExternalLink size={10} />
                          </a>
                        )}
                        <button
                          onClick={() => handleConnect(conn.id)}
                          disabled={loading === conn.id}
                          className="ml-auto flex items-center gap-2 px-5 py-2 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50"
                        >
                          {loading === conn.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />
                          ) : (
                            <Link2 size={14} />
                          )}
                          Connecter {conn.name}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

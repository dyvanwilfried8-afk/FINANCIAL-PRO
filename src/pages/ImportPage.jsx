import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { usePortfolio } from '../hooks/usePortfolio'
import {
  Upload, Link2, CheckCircle, AlertCircle,
  FileText, X, Download, Globe, Table2,
  Key, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react'

const CSV_TEMPLATE = `name,ticker,asset_type,quantity,buy_price,current_value,currency
Apple Inc,AAPL,stock,10,145.50,185.20,USD
Bitcoin,BTC,crypto,0.5,28000,42000,USD
Amundi ETF World,WPEA,etf,50,15.00,18.50,EUR
Appartement Paris,,real_estate,1,320000,380000,EUR
Livret A,,savings,1,5000,5000,EUR
`

// ── Convertit les données JSON Google Sheets API en tableau CSV-like ──────
function sheetsApiToRows(apiResponse) {
  const values = apiResponse.values
  if (!values || values.length < 2) return []
  const headers = values[0].map(h => h.toLowerCase().trim())
  return values.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] || '' })
    return obj
  })
}

// ── Convertit les données JSON Microsoft Graph en tableau CSV-like ─────────
function graphApiToRows(apiResponse) {
  // Graph API /usedRange retourne { values: [[...], [...]] }
  const values = apiResponse.values
  if (!values || values.length < 2) return []
  const headers = values[0].map(h => String(h).toLowerCase().trim())
  return values.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? String(row[i]) : '' })
    return obj
  })
}

const API_SOURCES = [
  // ── GOOGLE SHEETS ─────────────────────────────────────────────────────────
  {
    id: 'google_sheets_api',
    name: 'Google Sheets',
    icon: '📋',
    badge: 'Clé API',
    badgeColor: '#0F9D58',
    description: 'Accès sécurisé via Google Sheets API v4',
    fields: [
      {
        key: 'apiKey',
        label: 'Clé API Google',
        type: 'password',
        placeholder: 'AIzaSy...',
        hint: 'Créée dans Google Cloud Console → APIs & Services → Credentials',
      },
      {
        key: 'sheetId',
        label: 'ID du Google Sheet',
        type: 'text',
        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
        hint: 'Visible dans l\'URL : docs.google.com/spreadsheets/d/[ID]/edit',
      },
      {
        key: 'range',
        label: 'Plage de cellules (optionnel)',
        type: 'text',
        placeholder: 'Feuille1!A1:G100',
        hint: 'Laisser vide pour importer toute la première feuille',
      },
    ],
    howToGetKey: {
      title: 'Comment obtenir une clé API Google',
      steps: [
        { num: 1, text: 'Va sur', link: 'https://console.cloud.google.com', linkText: 'console.cloud.google.com' },
        { num: 2, text: 'Crée un projet (ou sélectionne un existant)' },
        { num: 3, text: 'Menu gauche → APIs & Services → Library' },
        { num: 4, text: 'Recherche "Google Sheets API" → Activer' },
        { num: 5, text: 'APIs & Services → Credentials → Create Credentials → API Key' },
        { num: 6, text: 'Copie la clé générée ici' },
        { num: 7, text: 'Optionnel : restreindre la clé à "Sheets API" pour la sécurité' },
      ],
      note: 'La feuille doit être partagée en lecture publique OU tu dois utiliser OAuth2 pour les feuilles privées.',
    },
    fetch: async (fields) => {
      const { apiKey, sheetId, range } = fields
      if (!apiKey || !sheetId) throw new Error('Clé API et ID de feuille requis')
      const r = range || 'A1:Z1000'
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(r)}?key=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || `Erreur HTTP ${res.status}`)
      }
      const data = await res.json()
      return sheetsApiToRows(data)
    },
  },

  // ── MICROSOFT EXCEL / GRAPH API ───────────────────────────────────────────
  {
    id: 'excel_graph',
    name: 'Excel Online',
    icon: '📊',
    badge: 'Graph API',
    badgeColor: '#217346',
    description: 'Accès via Microsoft Graph API (OneDrive / SharePoint)',
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token Microsoft Graph',
        type: 'password',
        placeholder: 'eyJ0eXAiOiJKV1Q...',
        hint: 'Obtenu via Graph Explorer ou ton application Azure AD',
      },
      {
        key: 'driveItemId',
        label: 'ID du fichier OneDrive',
        type: 'text',
        placeholder: '01ABCDEF1234567890ABCDEF',
        hint: 'Visible dans l\'URL OneDrive ou via l\'API /me/drive/root/children',
      },
      {
        key: 'worksheet',
        label: 'Nom de la feuille (optionnel)',
        type: 'text',
        placeholder: 'Feuil1',
        hint: 'Laisser vide pour la première feuille du classeur',
      },
    ],
    howToGetKey: {
      title: 'Comment obtenir un Access Token Microsoft Graph',
      steps: [
        { num: 1, text: 'Va sur', link: 'https://developer.microsoft.com/en-us/graph/graph-explorer', linkText: 'Graph Explorer' },
        { num: 2, text: 'Connecte-toi avec ton compte Microsoft (en haut à gauche)' },
        { num: 3, text: 'Clique sur ton profil → "Access token" → copie le token' },
        { num: 4, text: 'Pour trouver l\'ID du fichier : tape dans Graph Explorer :', code: 'GET https://graph.microsoft.com/v1.0/me/drive/root/children' },
        { num: 5, text: 'Trouve ton fichier dans la réponse, copie son "id"' },
      ],
      note: 'Le token expire après 1h. Pour une solution permanente, crée une application Azure AD avec des credentials client.',
      altLink: 'https://portal.azure.com',
      altLinkText: 'Azure Portal (app permanente)',
    },
    fetch: async (fields) => {
      const { accessToken, driveItemId, worksheet } = fields
      if (!accessToken || !driveItemId) throw new Error('Access Token et ID du fichier requis')
      const wsSegment = worksheet ? `worksheets/${encodeURIComponent(worksheet)}` : 'worksheets/{00000000-0001-0000-0000-000000000000}'
      const url = `https://graph.microsoft.com/v1.0/me/drive/items/${driveItemId}/workbook/worksheets/${worksheet || ''}/usedRange`
      const res = await fetch(url.replace('//', '/'), {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Erreur HTTP ${res.status} — token expiré ou ID invalide`)
      }
      const data = await res.json()
      return graphApiToRows(data)
    },
  },

  // ── BINANCE ───────────────────────────────────────────────────────────────
  {
    id: 'binance',
    name: 'Binance',
    icon: '🟡',
    badge: 'API Key',
    badgeColor: '#F3BA2F',
    description: 'Importe ton portefeuille crypto Binance en temps réel',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key Binance',
        type: 'text',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: 'Paramètres Binance → Gestion des API → Créer une API (lecture seule)',
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        hint: 'Affiché une seule fois à la création — copie-le immédiatement',
      },
    ],
    howToGetKey: {
      title: 'Comment créer une clé API Binance',
      steps: [
        { num: 1, text: 'Connecte-toi sur', link: 'https://www.binance.com', linkText: 'binance.com' },
        { num: 2, text: 'Profil → Paramètres → Gestion des API' },
        { num: 3, text: 'Clique "Créer une API" → choisir "Clé système générée"' },
        { num: 4, text: 'Active UNIQUEMENT "Lire les informations" (pas de trading !)' },
        { num: 5, text: 'Copie la clé API et le Secret Key' },
      ],
      note: '⚠️ N\'active jamais le trading sur une clé API partagée avec une app tierce.',
    },
    fetch: async (fields) => {
      const { apiKey, secretKey } = fields
      if (!apiKey || !secretKey) throw new Error('Clé API et Secret Key requis')
      // Note : Binance requiert une signature HMAC-SHA256 côté serveur
      // En production, passer par une Edge Function Supabase pour sécuriser le secret
      throw new Error('Binance requiert une signature serveur. Utilise la page "Connexions API" pour configurer Binance de façon sécurisée.')
    },
  },
]

export default function ImportPage() {
  const { importFromCSV } = usePortfolio()
  const [tab, setTab] = useState('csv')
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  const [selectedSource, setSelectedSource] = useState(null)
  const [apiFields, setApiFields] = useState({})
  const [apiLoading, setApiLoading] = useState(false)
  const [showHowTo, setShowHowTo] = useState(false)

  // URL directe
  const [rawUrl, setRawUrl] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)

  const fileRef = useRef()

  const parseAndPreview = (csvText) => {
    Papa.parse(csvText, {
      header: true, skipEmptyLines: true,
      complete: (r) => {
        if (!r.data.length) return setResult({ type: 'error', message: 'Aucune donnée trouvée.' })
        setPreview(r.data); setResult(null)
      },
      error: (err) => setResult({ type: 'error', message: err.message }),
    })
  }

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => parseAndPreview(e.target.result)
    reader.readAsText(file, 'UTF-8')
  }

  const handleUrlImport = async () => {
    if (!rawUrl.trim()) return
    setUrlLoading(true); setResult(null)
    try {
      // Google Sheets URL → convertit en export CSV
      const gsMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      const gidMatch = rawUrl.match(/gid=(\d+)/)
      const fetchUrl = gsMatch
        ? `https://docs.google.com/spreadsheets/d/${gsMatch[1]}/export?format=csv&gid=${gidMatch?.[1] || 0}`
        : rawUrl.trim()

      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      parseAndPreview(text)
    } catch (err) {
      setResult({ type: 'error', message: `Erreur : ${err.message} — vérifiez que l'URL est publique.` })
    }
    setUrlLoading(false)
  }

  const handleApiImport = async () => {
    if (!selectedSource) return
    setApiLoading(true); setResult(null)
    try {
      const rows = await selectedSource.fetch(apiFields)
      if (!rows.length) throw new Error('Aucune donnée retournée par l\'API')
      setPreview(rows)
    } catch (err) {
      setResult({ type: 'error', message: err.message })
    }
    setApiLoading(false)
  }

  const handleImport = async () => {
    if (!preview?.length) return
    setImporting(true)
    const { error } = await importFromCSV(preview)
    setImporting(false)
    if (error) setResult({ type: 'error', message: error.message })
    else { setResult({ type: 'success', message: `✅ ${preview.length} actifs importés !` }); setPreview(null) }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'financial_pro_template.csv'
    a.click()
  }

  const tabs = [
    { id: 'csv', label: '📁 Fichier CSV' },
    { id: 'url', label: '🔗 URL directe' },
    { id: 'api', label: '🔑 Clé API' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">Importer des actifs</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          CSV, URL publique, ou connexion API sécurisée (Google Sheets, Excel, Binance…)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-xl p-1 w-fit">
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => { setTab(id); setResult(null); setPreview(null); setSelectedSource(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
              tab === id ? 'bg-surface-4 text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}>{label}</button>
        ))}
      </div>

      {/* ── TAB CSV ── */}
      {tab === 'csv' && (
        <div className="space-y-5">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragging ? 'border-accent-green bg-accent-green/5' : 'border-surface-4 hover:bg-surface-2/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
            <Upload size={22} className="text-text-secondary mx-auto mb-3" />
            <p className="font-display font-medium text-text-primary mb-1">Glisser un fichier CSV ici</p>
            <p className="text-text-muted text-sm">ou cliquer pour parcourir</p>
          </div>
          <button onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-green transition-colors">
            <Download size={15} /> Télécharger le template CSV
          </button>
          <div className="bg-surface-2 border border-surface-3 rounded-xl p-4 text-xs font-mono text-text-secondary">
            name, ticker, asset_type, quantity, buy_price, current_value, currency
          </div>
        </div>
      )}

      {/* ── TAB URL DIRECTE ── */}
      {tab === 'url' && (
        <div className="space-y-5">
          <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-text-primary">URL directe (CSV public)</h3>
            <p className="text-text-secondary text-sm font-body">
              Fonctionne avec Google Sheets partagé publiquement, ou n'importe quelle URL retournant un CSV.
            </p>
            <div>
              <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">URL</label>
              <input type="url" value={rawUrl} onChange={e => setRawUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/VOTRE_ID/edit  ou  https://exemple.com/data.csv"
                className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent-green/50 transition-all" />
              <p className="text-xs text-text-muted mt-1.5 font-body">
                Google Sheets : la feuille doit être partagée → "Toute personne avec le lien"
              </p>
            </div>
            <button onClick={handleUrlImport} disabled={!rawUrl.trim() || urlLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50">
              {urlLoading ? <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" /> : <Globe size={14} />}
              Charger les données
            </button>
          </div>
        </div>
      )}

      {/* ── TAB CLÉ API ── */}
      {tab === 'api' && (
        <div className="space-y-6">
          {/* Source selector */}
          <div className="grid sm:grid-cols-3 gap-4">
            {API_SOURCES.map(src => (
              <button key={src.id}
                onClick={() => { setSelectedSource(src); setApiFields({}); setShowHowTo(false); setPreview(null); setResult(null) }}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selectedSource?.id === src.id ? 'border-accent-green/40 bg-accent-green/5' : 'border-surface-3 bg-surface-1 hover:border-surface-4'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{src.icon}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-display font-semibold"
                    style={{ background: src.badgeColor + '25', color: src.badgeColor }}>
                    {src.badge}
                  </span>
                </div>
                <div className="font-display font-semibold text-text-primary text-sm mb-1">{src.name}</div>
                <div className="text-text-muted text-xs font-body leading-relaxed">{src.description}</div>
              </button>
            ))}
          </div>

          {selectedSource && (
            <div className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-3 bg-surface-2">
                <span className="text-xl">{selectedSource.icon}</span>
                <div>
                  <div className="font-display font-semibold text-text-primary">{selectedSource.name}</div>
                  <div className="text-text-muted text-xs font-body">{selectedSource.description}</div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Fields */}
                {selectedSource.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={apiFields[field.key] || ''}
                      onChange={e => setApiFields(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
                    />
                    {field.hint && (
                      <p className="text-xs text-text-muted mt-1 font-body">{field.hint}</p>
                    )}
                  </div>
                ))}

                {/* How to get the key — accordion */}
                <div className="border border-surface-3 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowHowTo(!showHowTo)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-display font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Key size={14} />
                      {selectedSource.howToGetKey.title}
                    </span>
                    {showHowTo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showHowTo && (
                    <div className="px-4 pb-4 space-y-3 border-t border-surface-3 pt-4 bg-surface-2/30">
                      <div className="space-y-2">
                        {selectedSource.howToGetKey.steps.map(step => (
                          <div key={step.num} className="flex items-start gap-3 text-sm font-body">
                            <span className="w-5 h-5 rounded-full bg-accent-green/15 text-accent-green flex items-center justify-center flex-shrink-0 text-xs font-display font-semibold mt-0.5">
                              {step.num}
                            </span>
                            <span className="text-text-secondary">
                              {step.text}{' '}
                              {step.link && (
                                <a href={step.link} target="_blank" rel="noopener noreferrer"
                                  className="text-accent-blue hover:underline inline-flex items-center gap-0.5">
                                  {step.linkText} <ExternalLink size={10} />
                                </a>
                              )}
                              {step.code && (
                                <code className="block mt-1 bg-surface-3 px-3 py-1.5 rounded-lg text-xs font-mono text-text-primary">
                                  {step.code}
                                </code>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {selectedSource.howToGetKey.note && (
                        <div className="flex items-start gap-2 bg-accent-gold/10 border border-accent-gold/20 rounded-xl px-3 py-2.5 text-xs font-body text-accent-gold">
                          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                          {selectedSource.howToGetKey.note}
                        </div>
                      )}

                      {selectedSource.howToGetKey.altLink && (
                        <a href={selectedSource.howToGetKey.altLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent-blue hover:underline font-body">
                          {selectedSource.howToGetKey.altLinkText} <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Import button */}
                <button
                  onClick={handleApiImport}
                  disabled={apiLoading || !selectedSource.fields.every(f => !f.key.includes('Key') || apiFields[f.key])}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50"
                >
                  {apiLoading
                    ? <span className="w-4 h-4 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />
                    : <Link2 size={15} />
                  }
                  Importer depuis {selectedSource.name}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Preview ── */}
      {preview && (
        <div className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-3">
            <div className="flex items-center gap-2">
              <Table2 size={16} className="text-accent-green" />
              <span className="font-display font-medium text-text-primary text-sm">
                {preview.length} actif(s) prêts à importer
              </span>
            </div>
            <button onClick={() => setPreview(null)} className="text-text-muted hover:text-text-secondary">
              <X size={16} />
            </button>
          </div>
          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-xs">
              <thead className="bg-surface-2 sticky top-0">
                <tr>
                  {Object.keys(preview[0] || {}).map(k => (
                    <th key={k} className="px-4 py-2 text-left font-display font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-3">
                {preview.slice(0, 8).map((row, i) => (
                  <tr key={i} className="hover:bg-surface-2">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-4 py-2 font-mono text-text-secondary whitespace-nowrap">{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-surface-3 flex justify-end">
            <button onClick={handleImport} disabled={importing}
              className="px-5 py-2 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50 flex items-center gap-2">
              {importing && <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />}
              Importer {preview.length} actifs →
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`flex items-start gap-3 rounded-xl px-5 py-4 border text-sm font-body ${
          result.type === 'success' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
          : result.type === 'error' ? 'bg-accent-red/10 border-accent-red/20 text-accent-red'
          : 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
        }`}>
          {result.type === 'success' ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}

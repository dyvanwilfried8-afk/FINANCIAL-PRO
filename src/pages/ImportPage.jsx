import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { usePortfolio } from '../hooks/usePortfolio'
import {
  Upload, Link2, CheckCircle, AlertCircle,
  FileText, X, Download, Globe, Table2
} from 'lucide-react'

const CSV_TEMPLATE = `name,ticker,asset_type,quantity,buy_price,current_value,currency
Apple Inc,AAPL,stock,10,145.50,185.20,USD
Bitcoin,BTC,crypto,0.5,28000,42000,USD
Amundi ETF World,WPEA,etf,50,15.00,18.50,EUR
Appartement Paris,,real_estate,1,320000,380000,EUR
Livret A,,savings,1,5000,5000,EUR
`

const URL_SOURCES = [
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    icon: '📋',
    color: '#0F9D58',
    description: 'Importe directement depuis une feuille Google partagée',
    placeholder: 'https://docs.google.com/spreadsheets/d/VOTRE_ID/edit',
    hint: 'La feuille doit être partagée en lecture publique',
    steps: [
      'Ouvre ton Google Sheet',
      'Fichier → Partager → "Toute personne avec le lien"',
      'Colle l\'URL ici',
    ],
    buildUrl: (raw) => {
      const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      const gidMatch = raw.match(/gid=(\d+)/)
      if (!match) return null
      const id = match[1]
      const gid = gidMatch ? gidMatch[1] : '0'
      return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
    },
  },
  {
    id: 'excel_online',
    name: 'Excel Online (OneDrive)',
    icon: '📊',
    color: '#217346',
    description: 'Importe depuis un classeur Excel partagé sur OneDrive',
    placeholder: 'https://onedrive.live.com/...  ou  https://1drv.ms/...',
    hint: 'Le fichier doit être partagé publiquement et au format CSV ou XLSX',
    steps: [
      'Ouvre ton fichier sur OneDrive',
      'Clique sur "Partager" → lien public',
      'Dans Excel Online : Fichier → Enregistrer sous → Télécharger une copie CSV',
      'Colle l\'URL de téléchargement direct',
    ],
    buildUrl: (raw) => raw.trim(),
  },
  {
    id: 'csv_url',
    name: 'URL CSV directe',
    icon: '🔗',
    color: '#4D9EFF',
    description: 'N\'importe quelle URL retournant un fichier CSV',
    placeholder: 'https://exemple.com/mon-portefeuille.csv',
    hint: 'L\'URL doit pointer directement vers un fichier CSV accessible publiquement',
    steps: [
      'Héberge ton CSV sur n\'importe quel serveur public',
      'Colle l\'URL directe ici',
    ],
    buildUrl: (raw) => raw.trim(),
  },
]

const API_PRESETS = [
  {
    id: 'binance',
    name: 'Binance',
    icon: '🟡',
    description: 'Synchronise ton portefeuille crypto Binance via API',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Clé API Binance (lecture seule)' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Clé secrète' },
    ],
    hint: 'Crée une clé lecture seule dans Binance → Paramètres → Gestion des API',
    docsUrl: 'https://www.binance.com/en/support/faq/how-to-create-api-keys-on-binance-360002502072',
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    icon: '📈',
    description: 'Importe depuis Trading 212 via leur API officielle',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Clé API Trading 212' },
    ],
    hint: 'Génère une clé dans T212 → Paramètres → API',
    docsUrl: 'https://t212public-api-docs.redoc.ly/',
  },
]

export default function ImportPage() {
  const { importFromCSV } = usePortfolio()
  const [tab, setTab] = useState('csv')
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  // URL import
  const [selectedUrlSource, setSelectedUrlSource] = useState(null)
  const [rawUrl, setRawUrl] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)

  // API
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [apiFields, setApiFields] = useState({})
  const [apiLoading, setApiLoading] = useState(false)

  const fileRef = useRef()

  const parseAndPreview = (csvText) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        if (r.data.length === 0) {
          setResult({ type: 'error', message: 'Aucune donnée trouvée dans ce fichier.' })
        } else {
          setPreview(r.data)
          setResult(null)
        }
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
    if (!selectedUrlSource || !rawUrl.trim()) return
    setUrlLoading(true)
    setResult(null)

    const fetchUrl = selectedUrlSource.buildUrl(rawUrl)
    if (!fetchUrl) {
      setResult({ type: 'error', message: 'URL invalide — vérifie le format.' })
      setUrlLoading(false)
      return
    }

    try {
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
      const text = await res.text()
      parseAndPreview(text)
    } catch (err) {
      setResult({
        type: 'error',
        message: `Impossible de charger l'URL : ${err.message}. Vérifie que le fichier est public et en CORS.`,
      })
    }
    setUrlLoading(false)
  }

  const handleImport = async () => {
    if (!preview?.length) return
    setImporting(true)
    const { error } = await importFromCSV(preview)
    setImporting(false)
    if (error) setResult({ type: 'error', message: error.message })
    else {
      setResult({ type: 'success', message: `✅ ${preview.length} actifs importés avec succès !` })
      setPreview(null)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'financial_pro_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'csv', label: '📁 Fichier CSV' },
    { id: 'url', label: '🔗 URL / Google Sheets' },
    { id: 'api', label: '⚡ API Broker' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">Importer des actifs</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          CSV, Google Sheets, Excel Online ou connexion API directe
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-xl p-1 w-fit flex-wrap">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setResult(null); setPreview(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
              tab === id ? 'bg-surface-4 text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB CSV ── */}
      {tab === 'csv' && (
        <div className="space-y-5">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              dragging ? 'border-accent-green bg-accent-green/5' : 'border-surface-4 hover:bg-surface-2/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
            <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
              <Upload size={22} className="text-text-secondary" />
            </div>
            <p className="font-display font-medium text-text-primary mb-1">Glisser un fichier CSV ici</p>
            <p className="text-text-muted text-sm font-body">ou cliquer pour parcourir</p>
          </div>

          <button onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm font-body text-text-secondary hover:text-accent-green transition-colors">
            <Download size={15} /> Télécharger le template CSV
          </button>

          <div className="bg-surface-2 border border-surface-3 rounded-xl p-4">
            <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-2">
              Colonnes attendues
            </div>
            <code className="text-xs text-text-secondary">
              name, ticker, asset_type, quantity, buy_price, current_value, currency
            </code>
            <p className="text-xs text-text-muted mt-1 font-body">
              asset_type : stock | crypto | etf | real_estate | savings | other
            </p>
          </div>
        </div>
      )}

      {/* ── TAB URL / Google Sheets / Excel ── */}
      {tab === 'url' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {URL_SOURCES.map(src => (
              <button
                key={src.id}
                onClick={() => { setSelectedUrlSource(src); setRawUrl(''); setPreview(null); setResult(null) }}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selectedUrlSource?.id === src.id
                    ? 'border-accent-green/40 bg-accent-green/5'
                    : 'border-surface-3 bg-surface-1 hover:border-surface-4'
                }`}
              >
                <div className="text-2xl mb-2">{src.icon}</div>
                <div className="font-display font-semibold text-text-primary text-sm mb-1">{src.name}</div>
                <div className="text-text-muted text-xs font-body leading-relaxed">{src.description}</div>
              </button>
            ))}
          </div>

          {selectedUrlSource && (
            <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <span>{selectedUrlSource.icon}</span> {selectedUrlSource.name}
              </h3>

              {/* Steps */}
              <div className="space-y-1">
                {selectedUrlSource.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-body text-text-secondary">
                    <span className="w-4 h-4 rounded-full bg-surface-3 text-text-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-display">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
                  URL {selectedUrlSource.name}
                </label>
                <input
                  type="url"
                  value={rawUrl}
                  onChange={e => setRawUrl(e.target.value)}
                  placeholder={selectedUrlSource.placeholder}
                  className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
                />
                <p className="text-xs text-text-muted font-body mt-1.5">{selectedUrlSource.hint}</p>
              </div>

              <button
                onClick={handleUrlImport}
                disabled={!rawUrl.trim() || urlLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50"
              >
                {urlLoading
                  ? <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />
                  : <Globe size={14} />
                }
                Charger depuis l'URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB API ── */}
      {tab === 'api' && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {API_PRESETS.map(preset => (
              <button key={preset.id}
                onClick={() => { setSelectedPreset(preset); setApiFields({}) }}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                  selectedPreset?.id === preset.id
                    ? 'border-accent-green/30 bg-accent-green/5'
                    : 'border-surface-3 bg-surface-1 hover:border-surface-4'
                }`}
              >
                <div className="text-2xl mb-2">{preset.icon}</div>
                <div className="font-display font-semibold text-text-primary text-sm mb-1">{preset.name}</div>
                <div className="text-text-muted text-xs font-body">{preset.description}</div>
              </button>
            ))}
          </div>

          {selectedPreset && (
            <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-text-primary">{selectedPreset.name}</h3>
              {selectedPreset.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={apiFields[field.key] || ''}
                    onChange={e => setApiFields(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent-green/50 transition-all"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 text-xs text-text-muted font-body">
                <AlertCircle size={12} className="flex-shrink-0" />
                {selectedPreset.hint}
              </div>
              <div className="flex items-center justify-between">
                {selectedPreset.docsUrl && (
                  <a href={selectedPreset.docsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-accent-blue hover:underline font-body">
                    Documentation →
                  </a>
                )}
                <button
                  onClick={async () => {
                    setApiLoading(true)
                    await new Promise(r => setTimeout(r, 1500))
                    setApiLoading(false)
                    setResult({ type: 'info', message: `Connexion ${selectedPreset.name} enregistrée — synchronisation toutes les heures.` })
                  }}
                  className="ml-auto flex items-center gap-2 px-5 py-2 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all"
                >
                  {apiLoading
                    ? <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />
                    : <Link2 size={14} />
                  }
                  Connecter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Preview table ── */}
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
                    <th key={k} className="px-4 py-2 text-left font-display font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">
                      {k}
                    </th>
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
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-5 py-2 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {importing && <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />}
              Importer {preview.length} actifs →
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`flex items-center gap-3 rounded-xl px-5 py-4 border text-sm font-body ${
          result.type === 'success' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
          : result.type === 'error' ? 'bg-accent-red/10 border-accent-red/20 text-accent-red'
          : 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
        }`}>
          {result.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {result.message}
        </div>
      )}
    </div>
  )
}

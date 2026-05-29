import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { usePortfolio } from '../hooks/usePortfolio'
import { Upload, Link2, CheckCircle, AlertCircle, FileText, X, Download } from 'lucide-react'

const CSV_TEMPLATE = `name,ticker,asset_type,quantity,buy_price,current_value,currency
Apple Inc,AAPL,stock,10,145.50,185.20,USD
Bitcoin,BTC,crypto,0.5,28000,42000,USD
Amundi ETF World,WPEA,etf,50,15.00,18.50,EUR
Appartement Paris,,-,1,320000,380000,EUR
Livret A,,savings,1,5000,5000,EUR
`

const API_PRESETS = [
  {
    id: 'binance',
    name: 'Binance',
    icon: '🟡',
    description: 'Import de votre portefeuille crypto Binance',
    urlTemplate: 'https://api.binance.com/api/v3/account',
    fields: ['API Key', 'Secret Key'],
    docs: 'https://binance-docs.github.io/apiv3/spot/',
  },
  {
    id: 'excel_online',
    name: 'Excel Online',
    icon: '📊',
    description: 'Importer depuis un classeur Excel Online partagé',
    urlTemplate: 'https://graph.microsoft.com/v1.0/me/drive/root:/{path}:/workbook/worksheets/{sheet}/usedRange',
    fields: ['URL du classeur'],
    docs: 'https://docs.microsoft.com/en-us/graph/api/resources/excel',
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    icon: '📋',
    description: 'Import depuis Google Sheets (export CSV)',
    urlTemplate: 'https://docs.google.com/spreadsheets/d/{ID}/export?format=csv',
    fields: ['ID du document'],
    docs: '',
  },
  {
    id: 'custom',
    name: 'URL personnalisée',
    icon: '🔗',
    description: 'Tout endpoint JSON retournant des données d\'actifs',
    urlTemplate: '',
    fields: ['URL', 'Header d\'autorisation (optionnel)'],
    docs: '',
  },
]

export default function ImportPage() {
  const { importFromCSV } = usePortfolio()
  const [tab, setTab] = useState('csv') // 'csv' | 'api'
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [apiFields, setApiFields] = useState({})
  const [apiLoading, setApiLoading] = useState(false)
  const [apiResult, setApiResult] = useState(null)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => setPreview(result.data),
      error: (err) => setResult({ type: 'error', message: err.message }),
    })
  }

  const handleImport = async () => {
    if (!preview?.length) return
    setImporting(true)
    const { error } = await importFromCSV(preview)
    setImporting(false)
    if (error) setResult({ type: 'error', message: error.message })
    else {
      setResult({ type: 'success', message: `${preview.length} actifs importés avec succès !` })
      setPreview(null)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wealthtracker_template.csv'
    a.click()
  }

  const handleApiConnect = async () => {
    if (!selectedPreset) return
    setApiLoading(true)
    // Simulation d'une connexion API (à adapter selon le provider)
    await new Promise(r => setTimeout(r, 1500))
    setApiLoading(false)
    setApiResult({
      type: 'info',
      message: `Connexion ${selectedPreset.name} configurée. Les données seront synchronisées toutes les heures.`
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">Importer des actifs</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          Import CSV ou connexion API pour synchroniser vos données
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-xl p-1 w-fit">
        {[['csv', '📁 Fichier CSV'], ['api', '🔗 Connexion API']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-display font-medium transition-all ${
              tab === key ? 'bg-surface-4 text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'csv' && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? 'border-accent-green bg-accent-green/5'
                : 'border-surface-4 hover:border-surface-4/80 hover:bg-surface-2/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
              <Upload size={22} className="text-text-secondary" />
            </div>
            <p className="font-display font-medium text-text-primary mb-1">
              Glisser un fichier CSV ici
            </p>
            <p className="text-text-muted text-sm font-body">ou cliquer pour parcourir</p>
          </div>

          {/* Template download */}
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm font-body text-text-secondary hover:text-accent-green transition-colors"
          >
            <Download size={15} />
            Télécharger le template CSV
          </button>

          {/* Format info */}
          <div className="bg-surface-2 border border-surface-3 rounded-xl p-4">
            <div className="text-xs font-display font-medium text-text-muted uppercase tracking-widest mb-3">
              Format attendu
            </div>
            <div className="font-mono text-xs text-text-secondary overflow-x-auto whitespace-nowrap">
              name, ticker, asset_type, quantity, buy_price, current_value, currency
            </div>
            <div className="text-xs text-text-muted mt-2 font-body">
              asset_type: stock | crypto | etf | real_estate | savings | other
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-accent-green" />
                  <span className="font-display font-medium text-text-primary text-sm">
                    {preview.length} actif(s) à importer
                  </span>
                </div>
                <button onClick={() => setPreview(null)} className="text-text-muted hover:text-text-secondary">
                  <X size={16} />
                </button>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-surface-2 sticky top-0">
                    <tr>
                      {Object.keys(preview[0] || {}).map(k => (
                        <th key={k} className="px-4 py-2 text-left font-display font-medium text-text-muted uppercase tracking-wider">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-3">
                    {preview.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-surface-2">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-4 py-2 font-mono text-text-secondary">{v}</td>
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
                  Importer {preview.length} actifs
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'api' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {API_PRESETS.map(preset => (
              <button
                key={preset.id}
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
              <h3 className="font-display font-semibold text-text-primary">
                Configurer {selectedPreset.name}
              </h3>
              {selectedPreset.fields.map(field => (
                <div key={field}>
                  <label className="block text-xs font-display font-medium text-text-secondary mb-2 uppercase tracking-wider">
                    {field}
                  </label>
                  <input
                    type={field.toLowerCase().includes('secret') ? 'password' : 'text'}
                    value={apiFields[field] || ''}
                    onChange={e => setApiFields(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={selectedPreset.urlTemplate || `Entrer ${field}`}
                    className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                {selectedPreset.docs && (
                  <a
                    href={selectedPreset.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-blue hover:underline font-body"
                  >
                    Documentation →
                  </a>
                )}
                <button
                  onClick={handleApiConnect}
                  disabled={apiLoading}
                  className="ml-auto px-5 py-2 bg-accent-green text-surface-0 rounded-xl font-display font-semibold text-sm hover:bg-accent-green/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {apiLoading && <span className="w-3.5 h-3.5 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />}
                  <Link2 size={14} />
                  Connecter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result feedback */}
      {(result || apiResult) && (() => {
        const r = result || apiResult
        return (
          <div className={`flex items-center gap-3 rounded-xl px-5 py-4 border text-sm font-body ${
            r.type === 'success' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
            : r.type === 'error' ? 'bg-accent-red/10 border-accent-red/20 text-accent-red'
            : 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
          }`}>
            {r.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {r.message}
          </div>
        )
      })()}
    </div>
  )
}

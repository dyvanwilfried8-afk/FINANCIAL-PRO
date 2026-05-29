import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { TrendingUp, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/dashboard')
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setSuccess('Vérifiez votre email pour confirmer votre compte ✓')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,229,160,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(77,158,255,0.06) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-accent-green" />
            </div>
            <span className="font-display font-bold text-2xl text-text-primary tracking-tight">
              FINANCIAL-PRO
            </span>
          </div>
          <p className="text-text-secondary text-sm font-body">
            Votre patrimoine, en un coup d'œil
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-1 border border-surface-3 rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Tabs */}
          <div className="flex gap-1 bg-surface-2 rounded-xl p-1 mb-8">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                  mode === m
                    ? 'bg-surface-4 text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-display font-medium text-text-secondary mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-body focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-display font-medium text-text-secondary mb-2 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 pr-12 text-text-primary placeholder-text-muted text-sm font-body focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-accent-red text-sm">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 rounded-xl px-4 py-3 text-accent-green text-sm">
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-green text-surface-0 font-display font-semibold py-3 rounded-xl hover:bg-accent-green/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs mt-6 font-body">
          Données stockées de façon sécurisée sur Supabase
        </p>
      </div>
    </div>
  )
}

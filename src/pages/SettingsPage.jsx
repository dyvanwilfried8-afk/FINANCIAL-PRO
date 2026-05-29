import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AlertTriangle, Trash2, User, Shield, Bell } from 'lucide-react'

export default function SettingsPage() {
  const { user, deleteAccount, signOut } = useAuth()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') return
    setDeleting(true)
    setDeleteError('')
    const { error } = await deleteAccount()
    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-text-primary tracking-tight">Paramètres</h1>
        <p className="text-text-secondary text-sm font-body mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Account info */}
      <section className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-3 bg-surface-2">
          <User size={16} className="text-accent-green" />
          <h2 className="font-display font-semibold text-text-primary text-sm">Mon compte</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
              Adresse email
            </label>
            <div className="bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 font-mono text-sm text-text-secondary">
              {user?.email}
            </div>
          </div>
          <div>
            <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
              ID utilisateur
            </label>
            <div className="bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 font-mono text-xs text-text-muted truncate">
              {user?.id}
            </div>
          </div>
          <div>
            <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
              Membre depuis
            </label>
            <div className="bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 font-mono text-sm text-text-secondary">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
              }) : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-3 bg-surface-2">
          <Shield size={16} className="text-accent-blue" />
          <h2 className="font-display font-semibold text-text-primary text-sm">Sécurité</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-medium text-text-primary text-sm mb-1">Mot de passe</div>
              <div className="text-text-muted text-xs font-body">Réinitialisez votre mot de passe par email</div>
            </div>
            <button className="px-4 py-2 bg-surface-3 border border-surface-4 rounded-xl text-sm font-display font-medium text-text-secondary hover:text-text-primary transition-all">
              Réinitialiser
            </button>
          </div>
        </div>
      </section>

      {/* Data & Privacy */}
      <section className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-3 bg-surface-2">
          <Bell size={16} className="text-accent-gold" />
          <h2 className="font-display font-semibold text-text-primary text-sm">Données & Confidentialité</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-medium text-text-primary text-sm mb-1">Exporter mes données</div>
              <div className="text-text-muted text-xs font-body">Télécharger un export JSON de tous vos actifs</div>
            </div>
            <button className="px-4 py-2 bg-surface-3 border border-surface-4 rounded-xl text-sm font-display font-medium text-text-secondary hover:text-text-primary transition-all">
              Exporter JSON
            </button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-accent-red/5 border border-accent-red/20 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-accent-red/15 bg-accent-red/5">
          <AlertTriangle size={16} className="text-accent-red" />
          <h2 className="font-display font-semibold text-accent-red text-sm">Zone dangereuse</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="font-display font-medium text-text-primary text-sm mb-1">Supprimer mon compte</div>
            <p className="text-text-muted text-xs font-body mb-4">
              Cette action est irréversible. Toutes vos données (actifs, historique, paramètres) seront supprimées définitivement.
            </p>

            <label className="block text-xs font-display font-medium text-text-muted uppercase tracking-wider mb-2">
              Tapez <span className="font-mono text-accent-red">SUPPRIMER</span> pour confirmer
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full bg-surface-2 border border-accent-red/20 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent-red/40 transition-all mb-3"
            />

            {deleteError && (
              <div className="text-accent-red text-sm font-body mb-3">{deleteError}</div>
            )}

            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'SUPPRIMER' || deleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-red text-white rounded-xl font-display font-semibold text-sm hover:bg-accent-red/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Supprimer définitivement mon compte
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

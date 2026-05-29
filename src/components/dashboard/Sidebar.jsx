import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  TrendingUp, LayoutDashboard, PiggyBank, Upload,
  Settings, LogOut, X, Link2
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/assets', icon: TrendingUp, label: 'Actifs' },
  { to: '/savings', icon: PiggyBank, label: 'Épargne' },
  { to: '/import', icon: Upload, label: 'Importer' },
  { to: '/connect', icon: Link2, label: 'Connexions API' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

export default function Sidebar({ onClose }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full bg-surface-1 border-r border-surface-3 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-surface-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
            <TrendingUp size={16} className="text-accent-green" />
          </div>
          <span className="font-display font-bold text-lg text-text-primary tracking-tight">
            FINANCIAL-PRO
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-surface-3">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display font-medium text-text-secondary hover:text-accent-red hover:bg-accent-red/5 transition-all duration-200"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </div>
  )
}

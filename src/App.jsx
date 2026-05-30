import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import AppLayout from './pages/AppLayout'
import DashboardPage from './pages/DashboardPage'
import AssetsPage from './pages/AssetsPage'
import SavingsPage from './pages/SavingsPage'
import ImportPage from './pages/ImportPage'
import ConnectPage from './pages/ConnectPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent-green/30 border-t-accent-green rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/FINANCIAL-PRO">
        <Routes>
          {/* Page auth — route publique exacte */}
          <Route
            index
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          {/* App protégée — routes imbriquées sous le layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="savings" element={<SavingsPage />} />
            <Route path="import" element={<ImportPage />} />
            <Route path="connect" element={<ConnectPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

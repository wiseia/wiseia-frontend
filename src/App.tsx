import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { UsersPage } from '@/pages/UsersPage'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AuthCallback } from '@/pages/AuthCallback'
import '@/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Rotas protegidas com layout */}
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="companies" element={<CompaniesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Rota de fallback */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
// ARQUIVO FINAL E CORRIGIDO: src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute'; // Nossa guarda de rota
import { AppLayout } from '@/components/layout/AppLayout';   // Nosso layout principal

// Importando todas as páginas
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { UploadPage } from '@/pages/UploadPage';
import { UsersPage } from '@/pages/UsersPage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { DepartmentsPage } from '@/pages/DepartmentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AuthCallback } from '@/pages/AuthCallback';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Router>
          <Routes>
            {/* ROTAS PÚBLICAS: Acessíveis por todos */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* ROTAS PROTEGIDAS: Agrupadas sob o ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
              {/* Todas as rotas aqui dentro só são acessíveis se o usuário estiver logado */}
              <Route element={<AppLayout />}>
                {/* As rotas aqui dentro usarão o layout com sidebar/header */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Rota de fallback final para qualquer outra coisa */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
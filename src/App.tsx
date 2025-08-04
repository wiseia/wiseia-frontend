// ARQUIVO CORRIGIDO: src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute'; // Nosso novo ProtectedRoute simples
import { AppLayout } from '@/components/layout/AppLayout'; // O layout principal com sidebar e header

// Importando todas as páginas
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { UploadPage } from '@/pages/UploadPage'; // Importando a página de upload
import { UsersPage } from '@/pages/UsersPage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AuthCallback } from '@/pages/AuthCallback';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Bloco de Rotas Protegidas */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout /> 
                </ProtectedRoute>
              }
            >
              {/* Quando alguém acessa a raiz "/", redireciona para o dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Todas as páginas filhas que usarão o layout principal */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="upload" element={<UploadPage />} /> {/* ROTA ADICIONADA AQUI */}
              <Route path="users" element={<UsersPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Rota de fallback para qualquer caminho não encontrado */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
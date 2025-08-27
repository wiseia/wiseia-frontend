// ARQUIVO FINAL E CORRIGIDO: src/components/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  // 1. A ETAPA MAIS IMPORTANTE:
  // Se ainda estivermos verificando a sessão, mostramos um spinner em tela cheia e PARAmos aqui.
  // Isso impede qualquer redirecionamento prematuro.
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 2. Se o carregamento terminou E NÃO há usuário, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se o carregamento terminou E HÁ um usuário, permite a passagem e renderiza
  // a página aninhada através do <Outlet />.
  return <Outlet />;
}
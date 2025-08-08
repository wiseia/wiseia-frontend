// ARQUIVO COMPLETO E ATUALIZADO COM DEPURAÇÃO: src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ================== LOG DE DEPURAÇÃO ADICIONADO ==================
  // Este log nos dirá exatamente qual o estado da autenticação quando o componente tenta renderizar.
  console.log("Status do ProtectedRoute:", { 
    isLoading: loading, 
    hasUser: !!user, 
    path: location.pathname 
  });
  // ================================================================

  // 1. Se o AuthContext ainda está verificando, mostramos uma tela de carregamento.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 2. Se, após o carregamento, não existir um usuário, redirecionamos para o login.
  if (!user) {
    // Adicionamos um log aqui também para ter certeza de que estamos sendo redirecionados.
    console.log("Usuário não encontrado, redirecionando para /login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se existe um usuário, permitimos o acesso.
  return <>{children}</>;
}
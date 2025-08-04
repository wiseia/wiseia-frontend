// ARQUIVO CORRIGIDO E SIMPLIFICADO: src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Usando nosso AuthContext principal
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth(); // Pegamos apenas o 'user' e o estado de 'loading'
  const location = useLocation();

  // 1. Se o AuthContext ainda está verificando se existe um usuário,
  //    mostramos uma tela de carregamento.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 2. Se, após o carregamento, não existir um 'user',
  //    significa que a pessoa não está logada. Redirecionamos para o login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se existe um 'user', a pessoa está logada.
  //    Permitimos o acesso à página solicitada (ex: /upload).
  return <>{children}</>;
}
// ARQUIVO NOVO: src/pages/AuthCallback.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export function AuthCallback() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // A lógica de troca de token é gerenciada pelo onAuthStateChange no AuthContext.
    // Aqui, nós apenas esperamos a sessão ser estabelecida e então redirecionamos.
    // O onAuthStateChange do Supabase vai pegar o evento de login via OAuth e
    // os tokens serão armazenados automaticamente na sessão do Supabase.
    
    // Se, após um curto período, a sessão estiver disponível, significa que o login foi um sucesso.
    if (session) {
      toast.success("Conectado com sucesso!");
      // Redireciona o usuário de volta para a página de onde ele veio ou para o dashboard.
      navigate('/settings', { replace: true });
    }
    
    // Poderíamos adicionar um timeout aqui para lidar com casos de erro, mas vamos manter simples por agora.

  }, [session, navigate]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <LoadingSpinner size="lg" />
      <h1 className="mt-6 text-xl font-semibold text-gray-700">
        Processando autorização...
      </h1>
      <p className="mt-2 text-gray-500">Por favor, aguarde.</p>
    </div>
  );
}
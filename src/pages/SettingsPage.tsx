// ARQUIVO NOVO E COMPLETO: src/pages/SettingsPage.tsx

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { GoogleIcon } from '@/components/ui/GoogleIcon'; // Criaremos este ícone
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function SettingsPage() {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(false);

  // Esta função irá iniciar o fluxo de autorização do Google
  const handleConnectGoogleDrive = async () => {
    setLoading(true);
    try {
      // Pedimos ao Supabase para gerar a URL de autorização do Google.
      // É mais seguro fazer isso do que construir a URL no frontend.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // A URL para onde o Google deve redirecionar o usuário após a autorização
          redirectTo: `${window.location.origin}/auth/callback`,
          // As permissões que estamos pedindo
          scopes: 'https://www.googleapis.com/auth/drive.file',
          // Importante: Pede um refresh_token para que possamos manter o acesso offline
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) throw error;
      // O Supabase se encarrega de redirecionar para a URL gerada
      
    } catch (error: any) {
      toast.error('Erro ao conectar com Google', { description: error.message });
      setLoading(false);
    }
  };

  // Por enquanto, não vamos listar as integrações, apenas permitir a conexão.
  const isMaster = userInfo?.role_name === 'MASTER';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">Gerencie as integrações e configurações da sua empresa.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Integrações de Armazenamento</h2>
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GoogleIcon className="w-8 h-8 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-800">Google Drive</h3>
                <p className="text-sm text-gray-500">Faça upload e gerencie documentos diretamente no seu Drive.</p>
              </div>
            </div>
            <div>
              {isMaster && (
                <Button onClick={handleConnectGoogleDrive} disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : "Conectar"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
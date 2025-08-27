// ARQUIVO FINAL, COMPLETO E DEFINITIVO: src/pages/SettingsPage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Hook para verificar a integração com Google Drive
function useGoogleDriveIntegration() {
  const { userInfo } = useAuth();
  return useQuery({
    queryKey: ['google_drive_integration', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return null;
      const { data, error } = await supabase.from('integrations').select('id, is_enabled').eq('company_id', userInfo.company_id).eq('provider', 'google').maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userInfo,
  });
}

// Hook para verificar a integração com OneDrive
function useOneDriveIntegration() {
  const { userInfo } = useAuth();
  return useQuery({
    queryKey: ['onedrive_integration', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return null;
      const { data, error } = await supabase.from('integrations').select('id, is_enabled').eq('company_id', userInfo.company_id).eq('provider', 'azure').maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userInfo,
  });
}

export function SettingsPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: googleIntegration, isLoading: loadingGoogle } = useGoogleDriveIntegration();
  const { data: oneDriveIntegration, isLoading: loadingOneDrive } = useOneDriveIntegration();

  // Efeito para mostrar a notificação ao voltar do callback
  useEffect(() => {
    const success = searchParams.get('integration_success');
    const error = searchParams.get('integration_error');
    if (success) {
      toast.success("Integração conectada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['google_drive_integration', 'onedrive_integration'] });
      navigate('/settings', { replace: true });
    }
    if (error) {
      toast.error("Falha na integração", { description: error });
      navigate('/settings', { replace: true });
    }
  }, []); // Array vazio para rodar apenas uma vez

  // ==========================================================
  // LÓGICA DE CONEXÃO CORRETA E FINAL (USANDO O MÉTODO NATIVO)
  // ==========================================================
  const handleConnectGoogleDrive = async () => {
    setIsConnecting('google');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/drive.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      toast.error("Falha ao iniciar conexão com Google", { description: error.message });
    }
    setIsConnecting('');
  };

  const handleSyncGoogleDrive = async () => {
    setIsSyncing(true);
    toast.info("Iniciando sincronização...");
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-drive');
      if (error) throw error;
      toast.success(data.message || "Sincronização concluída!");
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (error: any) {
      toast.error("Falha na sincronização", { description: error.data?.error || error.message });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleConnectOneDrive = async () => {
    setIsConnecting('onedrive');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'Files.Read.All offline_access User.Read',
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error("Falha ao iniciar conexão com OneDrive", { description: error.message });
    }
    setIsConnecting('');
  };

  const isMaster = (userInfo?.user_roles?.hierarchy_level ?? 99) <= 1;

  if (authLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações e Integrações</h1>
        <p className="mt-2 text-gray-600">Conecte e sincronize suas fontes externas.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Armazenamento em Nuvem</h2>
        
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GoogleIcon className="w-8 h-8 mr-4" />
              <div>
                <h3 className="font-semibold">Google Drive</h3>
                <p className="text-sm text-gray-500">
                  {loadingGoogle ? "Verificando..." : googleIntegration?.is_enabled ? "Conectado." : "Não conectado."}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isMaster && googleIntegration?.is_enabled && (
                <Button variant="outline" onClick={handleSyncGoogleDrive} disabled={isSyncing}>
                  {isSyncing ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />} Sincronizar
                </Button>
              )}
              {isMaster && !googleIntegration?.is_enabled && (
                <Button onClick={handleConnectGoogleDrive} disabled={isConnecting !== ''}>
                  {isConnecting === 'google' ? <LoadingSpinner size="sm" /> : "Conectar"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg/239px-Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg.png" alt="OneDrive" className="w-8 h-8 mr-4" />
              <div>
                <h3 className="font-semibold">Microsoft OneDrive</h3>
                <p className="text-sm text-gray-500">
                  {loadingOneDrive ? "Verificando..." : oneDriveIntegration?.is_enabled ? "Conectado." : "Não conectado."}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isMaster && !oneDriveIntegration?.is_enabled && (
                <Button onClick={handleConnectOneDrive} disabled={isConnecting !== ''}>
                   {isConnecting === 'onedrive' ? <LoadingSpinner size="sm" /> : "Conectar"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
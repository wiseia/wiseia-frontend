// ARQUIVO FINAL, COMPLETO E SEGURO: src/pages/DashboardPage.tsx

import React, { useMemo } from 'react';
import { Users, FileText, Building2, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Department, Document } from '@/lib/supabase';

// Hooks para buscar documentos e departamentos (similares aos que já fizemos)
const useDocuments = () => {
  const { userInfo } = useAuth();
  return useQuery({
    queryKey: ['documents', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('documents').select('*').eq('company_id', userInfo.company_id);
      return (data as Document[]) || [];
    },
    enabled: !!userInfo?.company_id,
  });
};

const useDepartments = () => {
  const { userInfo } = useAuth();
  return useQuery({
    queryKey: ['departments', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('departments').select('*').eq('company_id', userInfo.company_id);
      return (data as Department[]) || [];
    },
    enabled: !!userInfo?.company_id,
  });
};


export function DashboardPage() {
  const { userInfo } = useAuth();
  
  // Buscando todos os dados necessários para o dashboard
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const { data: documents, isLoading: loadingDocuments } = useDocuments();

  // O estado de carregamento geral é true se QUALQUER uma das buscas estiver em andamento
  const isLoading = loadingUsers || loadingDepartments || loadingDocuments || !userInfo;

  // A lógica de métricas permanece a mesma, pois é excelente.
  const metrics = useMemo(() => {
    if (isLoading || !documents || !users || !departments) return []; // Guarda de segurança

    const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);

    return [
      { title: 'Departamentos', value: departments.length, icon: Building2 },
      { title: 'Usuários da Empresa', value: users.length, icon: Users },
      { title: 'Documentos da Empresa', value: documents.length, icon: FileText },
      { title: 'Armazenamento Total', value: `${(totalSize / (1024*1024)).toFixed(2)} MB`, icon: Database },
    ];
  }, [isLoading, users, departments, documents]);


  // ==========================================================
  // CORREÇÃO APLICADA AQUI: ESTADO DE CARREGAMENTO
  // Renderizamos um spinner ENQUANTO os dados estão sendo buscados.
  // ==========================================================
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-200 rounded-lg h-32 animate-pulse" />
          <div className="bg-gray-200 rounded-lg h-32 animate-pulse" />
          <div className="bg-gray-200 rounded-lg h-32 animate-pulse" />
          <div className="bg-gray-200 rounded-lg h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {userInfo.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Visão geral das métricas e atividades da sua empresa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
// ARQUIVO FINAL, COMPLETO E CORRIGIDO: src/pages/DashboardPage.tsx

import React from 'react'; // Import React
import { useQuery } from '@tanstack/react-query';
import { BarChart3, FileText, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Document } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// ===================================================================
// DEFINIÇÃO DOS COMPONENTES AUXILIARES
// ===================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center">
        <div className="rounded-md p-3 bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// O COMPONENTE PRINCIPAL DO DASHBOARD
// ===================================================================

export function DashboardPage() {
  const { userInfo } = useAuth();

  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['documents', userInfo?.id],
    queryFn: async () => {
      if (!userInfo) return [];
      const { data, error } = await supabase.from('documents').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!userInfo,
  });

  if (!userInfo) {
    return <div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo, {userInfo.full_name || userInfo.email}!
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-blue-100">Papel:</span>
          <span className="bg-blue-900/50 px-3 py-1 rounded-full text-sm font-medium">
            {userInfo.user_roles.role_name}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documentos Acessíveis"
          value={isLoading ? '...' : documents?.length ?? 0}
          icon={FileText}
        />
        <StatCard title="Sua Empresa" value={userInfo.company_id ? "Definida" : "N/A"} icon={Users} />
        <StatCard title="Seu Departamento" value={userInfo.department_id ? "Definido" : "N/A"} icon={Clock} />
        <StatCard title="Nível de Acesso" value={userInfo.user_roles.hierarchy_level} icon={BarChart3} />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seus Documentos</h3>
        {isLoading && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
        {error && <div className="text-red-600 p-4">Erro ao carregar dados: {error.message}</div>}
        {documents && (
          <div>
            {documents.length > 0 ? (
              documents.map((doc) => <div key={doc.id}>{doc.name}</div>)
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum documento encontrado para você.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
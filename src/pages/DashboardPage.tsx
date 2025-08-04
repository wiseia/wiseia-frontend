// ARQUIVO CORRIGIDO: src/pages/DashboardPage.tsx

import { useQuery } from '@tanstack/react-query'
import { BarChart3, FileText, Users, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Document } from '@/lib/supabase' // Importando nosso tipo de Documento

// Componente simples para mostrar um erro
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

// Componente para a tela de carregamento
function LoadingDisplay() {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  )
}

// Componente reutilizado de card de estatística (sem alterações)
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
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
  )
}


export function DashboardPage() {
  const { userInfo } = useAuth()

  // NOVA LÓGICA DE BUSCA DE DADOS: Direto da tabela 'documents'
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['documents', userInfo?.id], // A query depende do ID do usuário
    queryFn: async () => {
      // Confia 100% no RLS do Supabase para filtrar os documentos corretos!
      const { data, error } = await supabase.from('documents').select('*');
      
      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
    // Só executa a query se tivermos as informações do usuário
    enabled: !!userInfo, 
  })

  if (!userInfo || !userInfo.user_roles) {
    return <LoadingDisplay />
  }

  return (
    <div className="space-y-6">
      {/* Seção de boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
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
      
      {/* Estatísticas Simples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documentos Acessíveis"
          value={isLoading ? '...' : documents?.length ?? 0}
          icon={FileText}
        />
        <StatCard title="Sua Empresa" value={userInfo.company_id ? "Sim" : "Não"} icon={Users} />
        <StatCard title="Seu Departamento" value={userInfo.department_id ? "Sim" : "Não"} icon={Clock} />
        <StatCard title="Nível de Acesso" value={userInfo.user_roles.hierarchy_level} icon={BarChart3} />
      </div>

      {/* Tabela de Documentos */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seus Documentos</h3>
        {isLoading && <LoadingDisplay />}
        {error && <ErrorDisplay message={error.message} />}
        {documents && (
          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.file_type}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum documento encontrado para você.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
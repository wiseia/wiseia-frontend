import { useQuery } from '@tanstack/react-query'
import { BarChart3, FileText, Users, Building2, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

import { formatFileSize, formatDate, getRoleDisplayName, getRoleBadgeColor } from '@/lib/utils'

// Hook para buscar dados do dashboard
function useDashboardData(dashboardType: string) {
  return useQuery({
    queryKey: ['dashboard', dashboardType],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('dashboard-data', {
        body: {},
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      })
      
      if (error) throw error
      return data.data
    },
    enabled: !!dashboardType,
  })
}

// Componente de card de estatística
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`rounded-md p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Dashboard do Superusuário
function SuperuserDashboard({ data }: { data: any }) {
  const { platform_overview, subscription_breakdown, recent_activity, top_companies_by_users } = data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard da Plataforma</h2>
        <p className="mt-2 text-gray-600">Visão geral de todas as empresas e métricas globais</p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Empresas"
          value={platform_overview.total_companies}
          icon={Building2}
          color="blue"
          trend={`+${platform_overview.new_companies_this_month} este mês`}
        />
        <StatCard
          title="Total de Usuários"
          value={platform_overview.total_users}
          icon={Users}
          color="green"
          trend={`+${platform_overview.new_users_this_month} este mês`}
        />
        <StatCard
          title="Total de Documentos"
          value={platform_overview.total_documents}
          icon={FileText}
          color="purple"
          trend={`+${platform_overview.new_documents_this_month} este mês`}
        />
        <StatCard
          title="Armazenamento Total"
          value={`${platform_overview.total_storage_gb} GB`}
          icon={BarChart3}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de assinaturas */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planos de Assinatura</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Básico</span>
              <span className="font-semibold">{subscription_breakdown.basic}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Premium</span>
              <span className="font-semibold">{subscription_breakdown.premium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Enterprise</span>
              <span className="font-semibold">{subscription_breakdown.enterprise}</span>
            </div>
          </div>
        </div>

        {/* Top empresas */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Empresas por Usuários</h3>
          <div className="space-y-3">
            {top_companies_by_users.slice(0, 5).map((company: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.doc_count} documentos</p>
                </div>
                <span className="font-semibold text-blue-600">{company.user_count} usuários</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atividade recente */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente da Plataforma</h3>
        <div className="space-y-3">
          {recent_activity.slice(0, 10).map((activity: any) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Ação: <span className="font-medium">{activity.action}</span>
                  {activity.entity_type && (
                    <span className="text-gray-500"> em {activity.entity_type}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Dashboard da Empresa/Departamento
function CompanyDashboard({ data }: { data: any }) {
  const { scope, company_overview, file_type_distribution, recent_uploads, activity_last_7_days } = data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard {scope === 'company' ? 'da Empresa' : 'do Departamento'}
        </h2>
        <p className="mt-2 text-gray-600">
          Visão geral dos seus {scope === 'company' ? 'dados empresariais' : 'dados departamentais'}
        </p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documentos"
          value={company_overview.total_documents}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Usuários Ativos"
          value={company_overview.active_users}
          icon={Users}
          color="green"
        />
        {scope === 'company' && (
          <StatCard
            title="Departamentos"
            value={company_overview.total_departments}
            icon={Building2}
            color="purple"
          />
        )}
        <StatCard
          title="Armazenamento"
          value={`${company_overview.storage_used_gb} GB`}
          icon={BarChart3}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de tipos de arquivo */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Arquivo</h3>
          <div className="space-y-3">
            {Object.entries(file_type_distribution).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 uppercase">{type}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Uploads recentes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploads Recentes</h3>
          <div className="space-y-3">
            {recent_uploads.slice(0, 5).map((upload: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{upload.name}</p>
                  <p className="text-xs text-gray-500">
                    {upload.file_type.toUpperCase()} • {upload.size_mb} MB
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(upload.uploaded_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atividade dos últimos 7 dias */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
          <span className="text-sm text-gray-500">
            {activity_last_7_days} ações nos últimos 7 dias
          </span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Sistema de atividades em tempo real em desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  )
}

// Dashboard do Usuário
function UserDashboard({ data }: { data: any }) {
  const { personal_overview, recent_documents, notifications } = data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Meu Dashboard</h2>
        <p className="mt-2 text-gray-600">Seus documentos e atividades pessoais</p>
      </div>

      {/* Estatísticas pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Meus Documentos"
          value={personal_overview.my_documents}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Armazenamento Usado"
          value={`${personal_overview.storage_used_mb} MB`}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Notificações"
          value={personal_overview.unread_notifications}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Última Atividade"
          value={personal_overview.last_activity ? "Recente" : "Nenhuma"}
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos recentes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meus Documentos Recentes</h3>
          <div className="space-y-3">
            {recent_documents.length > 0 ? (
              recent_documents.map((doc: any) => (
                <div key={doc.id} className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.file_type.toUpperCase()} • {doc.size_mb} MB
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(doc.uploaded_at)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum documento encontrado</p>
            )}
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <div key={notification.id} className="border-l-4 border-blue-400 pl-3">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma notificação</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { userInfo } = useAuth()

  // Determinar tipo de dashboard baseado no papel do usuário
  const getDashboardType = () => {
    if (!userInfo) return 'user'
    
    switch (userInfo.role_name) {
      case 'SUPERUSER':
        return 'superuser'
      case 'MASTER':
      case 'MANAGER':
      case 'COORDINATOR':
        return userInfo.role_name.toLowerCase()
      default:
        return 'user'
    }
  }

  const dashboardType = getDashboardType()
  const { data, isLoading, error } = useDashboardData(dashboardType)

  if (!userInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Carregando informações do usuário...</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Seção de boas-vindas */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {userInfo.full_name}!
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-blue-100">Papel:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userInfo.role_name)}`}>
              {getRoleDisplayName(userInfo.role_name)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Seção de boas-vindas */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {userInfo.full_name}!
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-blue-100">Papel:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userInfo.role_name)}`}>
              {getRoleDisplayName(userInfo.role_name)}
            </span>
          </div>
        </div>
        
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-gray-600">Tente recarregar a página</p>
        </div>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (userInfo.role_name) {
      case 'SUPERUSER':
        return <SuperuserDashboard data={data} />
      case 'MASTER':
      case 'MANAGER':
      case 'COORDINATOR':
        return <CompanyDashboard data={data} />
      default:
        return <UserDashboard data={data} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Seção de boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo, {userInfo.full_name}!
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-blue-100">Papel:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userInfo.role_name)}`}>
            {getRoleDisplayName(userInfo.role_name)}
          </span>
        </div>
      </div>
      
      {/* Conteúdo do dashboard */}
      {renderDashboard()}
    </div>
  )
}
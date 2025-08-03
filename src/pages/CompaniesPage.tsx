import { useAuth } from '@/contexts/AuthContext'
import { Building2 } from 'lucide-react'

export function CompaniesPage() {
  const { userInfo } = useAuth()

  if (userInfo?.role_name !== 'SUPERUSER') {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">
          Apenas superusuários podem gerenciar empresas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
        <p className="mt-2 text-gray-600">
          Gerencie todas as empresas da plataforma
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Funcionalidade de gerenciamento de empresas em desenvolvimento.</p>
      </div>
    </div>
  )
}
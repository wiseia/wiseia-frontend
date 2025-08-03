import { useAuth } from '@/contexts/AuthContext'
import { Users } from 'lucide-react'

export function UsersPage() {
  const { userInfo } = useAuth()

  const canManageUsers = userInfo && ['MASTER', 'MANAGER', 'COORDINATOR'].includes(userInfo.role_name)

  if (!canManageUsers) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">
          Você não tem permissão para gerenciar usuários.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <p className="mt-2 text-gray-600">
          Gerencie os usuários {userInfo.role_name === 'MASTER' ? 'da empresa' : 'do departamento'}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Funcionalidade de gerenciamento de usuários em desenvolvimento.</p>
      </div>
    </div>
  )
}
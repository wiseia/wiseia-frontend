import { useAuth } from '@/contexts/AuthContext'
import { Settings as SettingsIcon } from 'lucide-react'

export function SettingsPage() {
  const { userInfo } = useAuth()

  const canManageSettings = userInfo && (
    userInfo.role_name === 'SUPERUSER' || 
    userInfo.role_name === 'MASTER'
  )

  if (!canManageSettings) {
    return (
      <div className="text-center py-12">
        <SettingsIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">
          Apenas superusuários e masters podem gerenciar configurações.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">
          {userInfo.role_name === 'SUPERUSER' 
            ? 'Configurações globais da plataforma'
            : 'Configurações da empresa'
          }
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Funcionalidade de configurações em desenvolvimento.</p>
      </div>
    </div>
  )
}
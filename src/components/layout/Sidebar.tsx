import { NavLink } from 'react-router-dom'
import { 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn, getRoleDisplayName, getInitials } from '@/lib/utils'

interface NavItemProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  badge?: string
}

function NavItem({ to, icon: Icon, children, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        )
      }
    >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
      {children}
      {badge && (
        <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-blue-100 text-blue-600">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { userInfo, signOut } = useAuth()

  if (!userInfo) return null

  const { role_name, full_name, hierarchy_level } = userInfo

  // Menu items baseado no nível do usuário
  const getMenuItems = () => {
    const baseItems = [
      { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    ]

    // Superusuário vê apenas empresas e relatórios globais
    if (role_name === 'SUPERUSER') {
      return [
        ...baseItems,
        { to: '/companies', icon: Building2, label: 'Empresas' },
        { to: '/settings', icon: Settings, label: 'Configurações' },
      ]
    }

    // Outros usuários veem documentos
    const userItems = [
      ...baseItems,
      { to: '/documents', icon: FileText, label: 'Documentos' },
    ]

    // Master, Manager e Coordinator podem gerenciar usuários
    if (['MASTER', 'MANAGER', 'COORDINATOR'].includes(role_name)) {
      userItems.push({ to: '/users', icon: Users, label: 'Usuários' })
    }

    // Master pode acessar configurações da empresa
    if (role_name === 'MASTER') {
      userItems.push({ to: '/settings', icon: Settings, label: 'Configurações' })
    }

    return userItems
  }

  const menuItems = getMenuItems()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg lg:block hidden">
      <div className="flex h-full flex-col">
        {/* Logo e título */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">WISEIA</h1>
              <p className="text-xs text-gray-500">Gestão de Documentos</p>
            </div>
          </div>
        </div>

        {/* Perfil do usuário */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {getInitials(full_name)}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {full_name}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleDisplayName(role_name)}
              </p>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavItem key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavItem>
            ))}
          </div>
        </nav>

        {/* Botão de logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
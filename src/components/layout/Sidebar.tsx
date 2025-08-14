// ARQUIVO ATUALIZADO: src/components/layout/Sidebar.tsx

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Upload, Building2 } from 'lucide-react'; // Importando o ícone Building2
import { useAuth } from '@/contexts/AuthContext';

// LISTA DE ITENS DE NAVEGAÇÃO CORRIGIDA
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'Documentos', icon: FileText },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/users', label: 'Usuários', icon: Users },
  { href: '/departments', label: 'Departamentos', icon: Building2 }, // <-- ITEM ADICIONADO AQUI
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const { userInfo, signOut } = useAuth();
  
  if (!userInfo) return null;

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-screen shrink-0">
      <div className="p-4 border-b text-center">
        <h1 className="text-2xl font-bold text-blue-600">WISEIA</h1>
        <div className="mt-2 text-sm">
          <p className="font-semibold">{userInfo.full_name}</p>
          <p className="text-xs text-gray-500 uppercase">{userInfo.user_roles.role_name}</p>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            to={item.href}
            key={item.label}
            className={({ isActive }) =>
              `flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 ` +
              (isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700')
            }
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t">
        <button 
            onClick={signOut}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
// ARQUIVO ATUALIZADO: src/components/layout/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Importando nosso AuthContext
import { Button } from '@/components/ui/Button';

// Lista de todos os itens de navegação possíveis
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, minLevel: 3 },
  { href: '/documents', label: 'Documentos', icon: FileText, minLevel: 3 },
  { href: '/users', label: 'Usuários', icon: Users, minLevel: 2 }, // Acessível por Manager e acima
  { href: '/departments', label: 'Departamentos', icon: Building2, minLevel: 1 }, // Acessível por Master e acima
  { href: '/settings', label: 'Configurações', icon: Settings, minLevel: 1 }, // Acessível por Master e acima
];

export function Sidebar() {
  const location = useLocation();
  const { userInfo, signOut } = useAuth(); // Usando nosso AuthContext

  // **CORREÇÃO IMPORTANTE:** Pega o nível hierárquico da estrutura correta
  const userLevel = userInfo?.user_roles?.hierarchy_level ?? 99; // Se não tiver, assume o nível mais baixo

  // Filtra os itens do menu que o usuário pode ver
  const allowedNavItems = navItems.filter(item => userLevel <= item.minLevel);

  return (
    <aside className="w-64 bg-gray-50 border-r flex flex-col h-screen">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">WISEIA</h1>
        {userInfo && (
          <div className="mt-2 text-sm">
            <p className="font-semibold">{userInfo.full_name}</p>
            <p className="text-xs text-gray-500">{userInfo.user_roles?.role_name}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {allowedNavItems.map((item) => (
          <Link to={item.href} key={item.label}>
            <Button
              variant={location.pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
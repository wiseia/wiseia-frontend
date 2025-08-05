// ARQUIVO COMPLETO E ATUALIZADO: src/pages/UsersPage.tsx

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, MoreHorizontal } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { EditUserModal } from './users/EditUserModal'; // Importando o novo modal

export function UsersPage() {
  const { userInfo } = useAuth();
  const { data: users, isLoading, error } = useUsers();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Verificação de segurança para garantir que userInfo e user_roles estão carregados
  if (!userInfo || !userInfo.user_roles) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  const canManage = userInfo.user_roles.hierarchy_level <= 2;

  // Função para abrir o modal de edição
  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (!canManage) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">Você não tem permissão para gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-2 text-gray-600">Gerencie os usuários e suas permissões.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Papel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr><td colSpan={4} className="text-center p-8"><LoadingSpinner /></td></tr>
              )}
              {error && (
                <tr><td colSpan={4} className="text-center p-8 text-red-500">Erro: {error.message}</td></tr>
              )}
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.user_roles?.role_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Botão de ações que chama a função handleEdit */}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renderiza o modal de edição se um usuário estiver selecionado */}
      {selectedUser && (
        <EditUserModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
        />
      )}
    </div>
  );
}
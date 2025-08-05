// ARQUIVO COMPLETO E CORRIGIDO: src/pages/users/EditUserModal.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDepartmentPermissions, useGrantPermission, useRevokePermission } from '@/hooks/usePermissions';
import { Trash2, PlusCircle } from 'lucide-react';
import { useEffect } from 'react';

const editUserSchema = z.object({
  full_name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  role_id: z.string().min(1, 'O papel é obrigatório.'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });
  
  useEffect(() => {
    if (user && isOpen) {
      reset({ full_name: user.full_name || '', role_id: user.user_roles?.id?.toString() || '' });
    }
  }, [user, isOpen, reset]);

  const { data: allRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*').order('hierarchy_level');
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: allDepartments } = useQuery({
    queryKey: ['departments', userInfo?.company_id],
    queryFn: async () => {
      if(!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('departments').select('id, name').eq('company_id', userInfo.company_id);
      if (error) throw new Error(error.message);
      return data;
    },
  });
  
  const { data: userPermissions, isLoading: isLoadingPermissions } = useDepartmentPermissions(user.id);

  const updateUserMutation = useMutation<void, Error, { full_name: string; role_id: number }>({
    mutationFn: async (updatedUser) => {
      const { error } = await supabase
        .from('users')
        .update({ full_name: updatedUser.full_name, role_id: updatedUser.role_id })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (error) => {
      toast.error(`Falha ao atualizar usuário: ${error.message}`);
    },
  });

  const grantPermissionMutation = useGrantPermission();
  const revokePermissionMutation = useRevokePermission();

  const onSubmit = (data: EditUserFormData) => {
    updateUserMutation.mutate({
      full_name: data.full_name,
      role_id: parseInt(data.role_id),
    });
  };
  
  const handleGrantPermission = () => {
    const selectElement = document.getElementById('new_permission_department_id') as HTMLSelectElement;
    const departmentId = selectElement.value;
    if (departmentId && userInfo?.id) {
      grantPermissionMutation.mutate({
        user_id: user.id,
        target_department_id: departmentId,
        granted_by_user_id: userInfo.id,
      });
      selectElement.value = "";
    } else {
      toast.info("Por favor, selecione um departamento.");
    }
  };
  
  const handleRevokePermission = (permissionId: string) => {
    if (window.confirm("Tem certeza que deseja revogar esta permissão?")) {
      // CORREÇÃO: Passamos o objeto com os dois IDs necessários para a mutação
      revokePermissionMutation.mutate({ permissionId: permissionId, userId: user.id });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Editar Usuário</h2>
        <p className="text-sm text-gray-500 mb-6">{user.email}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input id="full_name" {...register('full_name')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Papel (Role)</label>
                <select id="role_id" {...register('role_id')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                  {allRoles?.map((role) => (<option key={role.id} value={role.id}>{role.role_name}</option>))}
                </select>
                {errors.role_id && <p className="text-sm text-red-600 mt-1">{errors.role_id.message}</p>}
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium">Permissões Especiais de Acesso</h3>
            <p className="text-sm text-gray-500 mb-4">Conceda acesso a departamentos específicos (ex: Qualidade).</p>
            
            <div className="space-y-2 mb-4 border rounded-md p-4">
              <h4 className="font-medium text-sm text-gray-600">Acessos Concedidos:</h4>
              {isLoadingPermissions ? <LoadingSpinner size="sm" /> :
               userPermissions?.map((perm: any) => (
                <div key={perm.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm">Acesso ao departamento: <span className="font-semibold">{perm.department?.name || 'Departamento não encontrado'}</span></span>
                  <Button variant="ghost" size="sm" onClick={() => handleRevokePermission(perm.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {userPermissions?.length === 0 && !isLoadingPermissions && <p className="text-sm text-gray-400 text-center py-2">Nenhuma permissão especial.</p>}
            </div>

            <div className="flex items-end space-x-2 p-4 border-t">
              <div className="flex-1">
                <label htmlFor="new_permission_department_id" className="text-sm font-medium">Conceder acesso a:</label>
                <select id="new_permission_department_id" className="mt-1 block w-full bg-white border border-gray-300 rounded-md p-2">
                  <option value="">Selecione um departamento...</option>
                  {allDepartments?.map((dept) => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                </select>
              </div>
              <Button type="button" onClick={handleGrantPermission} disabled={grantPermissionMutation.isPending}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Conceder
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? <LoadingSpinner size="sm" /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
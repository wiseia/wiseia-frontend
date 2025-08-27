// ARQUIVO TRADUZIDO E COMPATÍVEL: src/pages/users/EditUserModal.tsx

import React from 'react'; //
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; // <--- MUDANÇA #1: Usando o AuthContext
import { supabase, FullUserInfo, Department } from '@/lib/supabase'; // Usando nossos tipos
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Trash2 } from 'lucide-react';

// Simplificando o schema por agora para focar na funcionalidade principal
const editUserSchema = z.object({
  full_name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  role_id: z.string().min(1, 'O papel é obrigatório.'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FullUserInfo | null; // Usando nosso tipo FullUserInfo
}

export function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { userInfo } = useAuth(); // <--- MUDANÇA #2: Usando o hook useAuth()
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    // Usamos useEffect abaixo para preencher os valores
  });

  // Efeito para preencher o formulário quando o usuário selecionado muda
  React.useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        role_id: user.user_roles?.id?.toString() || '',
      });
    }
  }, [user, reset]);


  // Hooks de React Query para buscar dados necessários no modal
  const { data: allRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw new Error(error.message);
      return data;
    }
  });
  
  const { data: allDepartments } = useQuery({
    queryKey: ['departments', userInfo?.company_id],
    queryFn: async () => {
      if(!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('departments').select('id, name').eq('company_id', userInfo.company_id);
      if (error) throw new Error(error.message);
      return data as Department[];
    }
  });
  
  // Mutation para atualizar o usuário
  const updateUserMutation = useMutation({
    mutationFn: async (updatedData: { full_name: string; role_id: number }) => {
      if (!user) throw new Error("Usuário não selecionado");
      const { error } = await supabase
        .from('users')
        .update({ full_name: updatedData.full_name, role_id: updatedData.role_id })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalida a query de usuários para atualizar a lista
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar usuário: ${error.message}`);
    },
  });

  const onSubmit = (data: EditUserFormData) => {
    updateUserMutation.mutate({
      full_name: data.full_name,
      role_id: parseInt(data.role_id),
    });
  };
  
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Editar Usuário</h2>
        <p className="text-sm text-gray-500 mb-6">{user.email}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="full_name">Nome Completo</label>
            <input id="full_name" {...register('full_name')} className="mt-1 w-full border rounded-md p-2" />
            {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
          </div>
          <div>
            <label htmlFor="role_id">Papel</label>
            <select id="role_id" {...register('role_id')} className="mt-1 w-full border rounded-md p-2 bg-white">
              {allRoles?.map((role: any) => (<option key={role.id} value={role.id}>{role.role_name}</option>))}
            </select>
            {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? <LoadingSpinner size="sm" /> : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
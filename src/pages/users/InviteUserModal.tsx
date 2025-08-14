// ARQUIVO FINAL E ATUALIZADO: src/pages/users/InviteUserModal.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const inviteSchema = z.object({
  email: z.string().email('Email inválido.'),
  full_name: z.string().min(3, 'Nome é obrigatório.'),
  role_id: z.string().min(1, 'Papel é obrigatório.'),
  department_id: z.string().optional(),
});
type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    mode: 'onChange',
  });

  const { data: allRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: allDepartments } = useQuery({
    queryKey: ['departments', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('departments').select('id, name').eq('company_id', userInfo.company_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userInfo?.company_id,
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (vars: { email: string; fullName: string; roleId: number; departmentId: string | null }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão inválida.');
      const accessToken = session.access_token;
      
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: vars,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Convite enviado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.context?.json?.()?.error || error.message;
      toast.error(`Falha ao enviar convite: ${errorMessage}`);
    },
  });

  // FUNÇÃO ONSUBMIT ATUALIZADA
  const onSubmit = (data: InviteFormData) => {
    const roleId = parseInt(data.role_id, 10);
    if (isNaN(roleId)) {
      toast.error("Ocorreu um erro. Por favor, selecione um papel válido.");
      return;
    }

    inviteUserMutation.mutate({
      email: data.email,
      fullName: data.full_name,
      roleId: roleId,
      departmentId: data.department_id || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6">Convidar Novo Usuário</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="full_name">Nome Completo</label>
            <input id="full_name" {...register('full_name')} className="mt-1 w-full border rounded-md p-2" />
            {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register('email')} className="mt-1 w-full border rounded-md p-2" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="role_id">Papel</label>
            <select id="role_id" {...register('role_id')} className="mt-1 w-full border rounded-md p-2 bg-white">
              <option value="">Selecione um papel...</option>
              {allRoles?.map((role: any) => <option key={role.id} value={role.id}>{role.role_name}</option>)}
            </select>
            {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id.message}</p>}
          </div>
          <div>
            <label htmlFor="department_id">Departamento (Opcional)</label>
            <select id="department_id" {...register('department_id')} className="mt-1 w-full border rounded-md p-2 bg-white">
              <option value="">Nenhum</option>
              {allDepartments?.map((dept: any) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!isValid || inviteUserMutation.isPending}>
              {inviteUserMutation.isPending ? <LoadingSpinner size="sm" /> : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ARQUIVO COMPLETO: src/pages/departments/CreateDepartmentModal.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const departmentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  parent_department_id: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDepartmentModal({ isOpen, onClose }: CreateDepartmentModalProps) {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('departments').select('id, name').eq('company_id', userInfo.company_id).is('parent_department_id', null);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userInfo?.company_id && isOpen,
  });

  const createDepartmentMutation = useMutation({
    mutationFn: async (newDepartment: DepartmentFormData) => {
      if (!userInfo?.company_id) throw new Error('Empresa do usuário não encontrada.');
      const { error } = await supabase.from('departments').insert([{
        name: newDepartment.name,
        company_id: userInfo.company_id,
        parent_department_id: newDepartment.parent_department_id || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Departamento criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(`Falha ao criar departamento: ${error.message}`);
    },
  });

  const onSubmit = (data: DepartmentFormData) => {
    createDepartmentMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6">Novo Departamento / Divisão</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input id="name" {...register('name')} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="parent_department_id" className="block text-sm font-medium text-gray-700">É uma Divisão de (Opcional)</label>
            <select id="parent_department_id" {...register('parent_department_id')} className="mt-1 block w-full bg-white border border-gray-300 rounded-md p-2">
              <option value="">Nenhum (é um Departamento principal)</option>
              {departments?.map((dept) => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={createDepartmentMutation.isPending}>Cancelar</Button>
            <Button type="submit" disabled={createDepartmentMutation.isPending}>
              {createDepartmentMutation.isPending ? <LoadingSpinner size="sm" /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
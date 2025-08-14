// ARQUIVO COMPLETO: src/pages/departments/EditDepartmentModal.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useEffect } from 'react';

const departmentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  parent_department_id: z.string().nullable(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: any;
}

export function EditDepartmentModal({ isOpen, onClose, department }: EditDepartmentModalProps) {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });
  
  useEffect(() => {
    if (department) {
      reset({ name: department.name, parent_department_id: department.parent_department_id });
    }
  }, [department, reset]);

  const { data: mainDepartments } = useQuery({
    queryKey: ['main_departments', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('departments').select('id, name').eq('company_id', userInfo.company_id).is('parent_department_id', null).not('id', 'eq', department.id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userInfo?.company_id && isOpen,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: DepartmentFormData) => {
      const { error } = await supabase.from('departments').update({ name: updatedData.name, parent_department_id: updatedData.parent_department_id || null }).eq('id', department.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Departamento atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    },
    onError: (error) => {
      toast.error(`Falha ao atualizar: ${error.message}`);
    },
  });

  const onSubmit = (data: DepartmentFormData) => {
    updateMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6">Editar Departamento: {department.name}</h2>
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
              {mainDepartments?.map((dept) => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>Cancelar</Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <LoadingSpinner size="sm" /> : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
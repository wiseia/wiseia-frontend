// ARQUIVO COMPLETO E CORRIGIDO: src/hooks/usePermissions.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query'; // Adicionando import que faltava
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Hook para buscar as permissões de acesso de um usuário específico
export function useDepartmentPermissions(userId: string) { // <<< 'export' ADICIONADO AQUI
  return useQuery({
    queryKey: ['permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('department_access_permissions')
        .select('*, department:departments(name)')
        .eq('user_id', userId);
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
  });
}

// Hook para conceder uma nova permissão de acesso
export function useGrantPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permission: { user_id: string, target_department_id: string, granted_by_user_id: string }) => {
      const { error } = await supabase.from('department_access_permissions').insert(permission);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success('Permissão concedida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['permissions', variables.user_id] });
    },
    onError: (error: any) => {
      toast.error(error.code === '23505' ? 'Este usuário já possui essa permissão.' : `Falha ao conceder permissão: ${error.message}`);
    },
  });
}

// Hook para revogar uma permissão de acesso
export function useRevokePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permissionId: string) => {
      const { error } = await supabase.from('department_access_permissions').delete().eq('id', permissionId);
      if (error) throw error;
    },
    // onSuccess será tratado na página para ter acesso ao userId
    onError: (error: any) => {
      toast.error(`Falha ao revogar permissão: ${error.message}`);
    },
  });
}
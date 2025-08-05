// ARQUIVO COMPLETO E CORRIGIDO: src/hooks/usePermissions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Hook para buscar as permissões de acesso de um usuário específico
export function useDepartmentPermissions(userId: string) {
  return useQuery({
    queryKey: ['permissions', userId], // A chave da query inclui o ID do usuário
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
      // Invalida a query específica das permissões DESTE usuário, forçando a re-busca.
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
    mutationFn: async ({ permissionId, userId }: { permissionId: string, userId: string }) => {
      const { error } = await supabase.from('department_access_permissions').delete().eq('id', permissionId);
      if (error) throw error;
      return { userId }; // Retorna o userId para o onSuccess
    },
    onSuccess: (data) => {
      toast.success('Permissão revogada com sucesso!');
      // Usa o userId retornado para invalidar a query correta
      queryClient.invalidateQueries({ queryKey: ['permissions', data.userId] });
    },
    onError: (error: any) => {
      toast.error(`Falha ao revogar permissão: ${error.message}`);
    },
  });
}
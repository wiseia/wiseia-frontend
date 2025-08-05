// ARQUIVO: src/hooks/useUsers.ts

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useUsers() {
  const { userInfo } = useAuth();

  return useQuery({
    queryKey: ['users', userInfo?.company_id, userInfo?.department_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];

      // A consulta é filtrada pelo RLS do Supabase, mas adicionamos filtros
      // no lado do cliente para otimizar e seguir a lógica de negócio.
      let query = supabase
        .from('users')
        .select('*, user_roles(*)') // Puxa o usuário e seu papel relacionado
        .eq('company_id', userInfo.company_id);
      
      // Se o usuário logado for MANAGER ou COORDINATOR, filtramos por departamento
      if (userInfo.user_roles?.hierarchy_level === 2) {
        if (userInfo.department_id) {
          query = query.eq('department_id', userInfo.department_id);
        } else {
          // Se um manager não tem depto, ele não pode ver ninguém (exceto ele mesmo, talvez)
          return []; 
        }
      }

      const { data, error } = await query.order('full_name');
      if (error) throw new Error(error.message);
      return data;
    },
    // A query só é ativada quando as informações do usuário, especialmente company_id, estão disponíveis.
    enabled: !!userInfo?.company_id,
  });
}
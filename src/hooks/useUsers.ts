// ARQUIVO CORRIGIDO E RECOMENDADO: src/hooks/useUsers.ts

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, FullUserInfo } from '@/lib/supabase'; // Importando FullUserInfo para tipagem correta

export function useUsers() {
  const { userInfo } = useAuth();

  return useQuery({
    // A chave da query depende apenas do company_id. Simples e eficaz.
    queryKey: ['users', userInfo?.company_id],
    
    queryFn: async () => {
      // Guarda de segurança: se não houver company_id, não executa a query.
      if (!userInfo?.company_id) {
        return [];
      }

      // Esta é a única query que você precisa.
      // O Supabase RLS no backend já garante que um usuário só pode ver
      // outros usuários da mesma empresa. Não precisamos replicar a lógica aqui.
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles (
            role_name,
            hierarchy_level
          )
        `)
        .eq('company_id', userInfo.company_id) // Filtro adicional para otimização
        .order('full_name');

      if (error) {
        // Se houver um erro, o exibimos no console para facilitar a depuração.
        console.error("Erro ao buscar usuários:", error);
        throw new Error(error.message);
      }
      
      // Retornamos os dados encontrados (ou um array vazio se não houver).
      return (data as FullUserInfo[]) || [];
    },
    
    // A query só é executada quando temos certeza que o userInfo e o company_id foram carregados.
    enabled: !!userInfo?.company_id,
  });
}
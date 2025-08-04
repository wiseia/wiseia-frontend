// ARQUIVO COMPLETO E CORRIGIDO: src/hooks/useUploadDocument.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface UploadData {
  file: File;
  title: string;
}

export const useUploadDocument = () => {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadData) => {
      const { file, title } = data;

      if (!userInfo || !userInfo.id || !userInfo.company_id) {
        throw new Error('Dados da empresa ou do usuário estão faltando.');
      }

      const fileExtension = file.name.split('.').pop();
      const filePath = `${userInfo.company_id}/${userInfo.id}/${uuidv4()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
      }

      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          name: title.trim(),
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          company_id: userInfo.company_id,
          department_id: userInfo.department_id, // Está OK se for null
          uploaded_by: userInfo.id,
        });

      if (insertError) {
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Falha ao registrar o documento: ${insertError.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      // Apenas invalida a query. A página se encarregará da notificação.
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: Error) => {
      // Apenas loga o erro. A página se encarregará da notificação.
      console.error("Erro detalhado no hook de upload:", error);
    },
  });
};
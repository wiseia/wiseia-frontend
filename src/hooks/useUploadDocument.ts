// ARQUIVO FINAL E ALINHADO: src/hooks/useUploadDocument.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// A INTERFACE CORRIGIDA AQUI
interface UploadData {
  file: File;
  title: string;
  storageProvider: 'supabase' | 'google_drive' | 'one_drive'; // Propriedade adicionada
}

export const useUploadDocument = () => {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadData) => {
      // Agora podemos desestruturar o storageProvider
      const { file, title, storageProvider } = data;

      if (!userInfo || !userInfo.id || !userInfo.company_id || !userInfo.user_roles) {
        throw new Error('Informações de perfil do usuário estão incompletas ou não foram carregadas.');
      }

      // A lógica de upload permanece a mesma...
      const departmentIdForUpload = userInfo.user_roles.role_name === 'MASTER' ? null : userInfo.department_id;
      if (userInfo.user_roles.role_name !== 'MASTER' && !departmentIdForUpload) {
        throw new Error('Seu perfil não está associado a um departamento.');
      }
      
      if (storageProvider === 'supabase') {
        const fileExtension = file.name.split('.').pop();
        const filePath = `${userInfo.company_id}/${departmentIdForUpload || 'company-level'}/${uuidv4()}.${fileExtension}`;
        
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
        
        const { error: insertError } = await supabase
          .from('documents').insert({
            name: title.trim(),
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            company_id: userInfo.company_id,
            department_id: departmentIdForUpload,
            uploaded_by: userInfo.id,
            storage_provider: 'SUPABASE',
          });

        if (insertError) {
          await supabase.storage.from('documents').remove([filePath]);
          throw new Error(`Falha ao registrar o documento: ${insertError.message}`);
        }
      } else {
        throw new Error('Outros provedores ainda não estão implementados.');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
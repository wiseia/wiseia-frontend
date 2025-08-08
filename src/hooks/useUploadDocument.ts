// ARQUIVO FINAL E CORRIGIDO: src/hooks/useUploadDocument.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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

      // 1. Validação de segurança: Verifica se temos todas as infos do usuário
      if (!userInfo || !userInfo.id || !userInfo.company_id || !userInfo.department_id) {
        throw new Error('Usuário não autenticado ou informações de perfil incompletas.');
      }

      // 2. Construir o caminho do arquivo para o Storage
      const fileExtension = file.name.split('.').pop();
      const filePath = `${userInfo.company_id}/${userInfo.id}/${uuidv4()}.${fileExtension}`;

      // 3. Fazer o upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents') // Este é o nome do seu BUCKET.
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
      }

      // 4. Inserir os metadados na tabela 'documents' do banco de dados
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          name: title.trim(),
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          company_id: userInfo.company_id,
          department_id: userInfo.department_id,
          uploaded_by: userInfo.id, // Usa o UUID da tabela 'users', não da 'auth.users'
        });

      // 5. Tratamento de erro: Se o registro no banco falhar, remover o arquivo órfão
      if (insertError) {
        console.error("Erro ao inserir no banco de dados, removendo arquivo do storage...");
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Falha ao registrar o documento: ${insertError.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Documento enviado com sucesso!');
      // Invalida a query de 'documents' para forçar a atualização da lista em outras páginas
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro no upload: ${error.message}`);
    },
  });
};
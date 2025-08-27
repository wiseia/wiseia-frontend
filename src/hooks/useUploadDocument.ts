import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UploadData { file: File; title: string; storageProvider: 'supabase' | 'google_drive'; }

export const useUploadDocument = () => {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadData) => {
      const { file, title, storageProvider } = data;
      if (!userInfo) throw new Error('Usuário não autenticado.');

      if (storageProvider === 'google_drive') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessão não encontrada.");
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('departmentId', userInfo.department_id || ''); 

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-drive`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
          body: formData,
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error || 'Falha no upload para o Google Drive.');

        await supabase.from('documents').insert({ name: title, file_path: responseData.fileId, /* ... */ });

      } else { /* ... sua lógica de upload para o Supabase Storage ... */ }
      return { success: true };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast.success("Upload concluído!"); },
    onError: (error: any) => { toast.error(`Falha no upload: ${error.message}`); },
  });
};
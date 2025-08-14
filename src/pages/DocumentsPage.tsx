// ARQUIVO FINAL E INTERATIVO: src/pages/DocumentsPage.tsx

import { useQuery } from '@tanstack/react-query';
import { supabase, Document } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Hook para buscar os documentos (sem alterações)
function useDocuments() {
  const { userInfo } = useAuth();
  return useQuery<Document[]>({
    queryKey: ['documents', userInfo?.id],
    queryFn: async () => {
      if (!userInfo) return [];
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!userInfo,
  });
}

export function DocumentsPage() {
  const { data: documents, isLoading, error } = useDocuments();
  const navigate = useNavigate();

  // NOVA FUNÇÃO: Lida com o clique no documento
  const handleDocumentClick = async (document: Document) => {
    try {
      // Gera uma URL assinada que expira em 60 segundos
      const { data, error } = await supabase.storage
        .from('documents') // O nome do nosso bucket
        .createSignedUrl(document.file_path, 60); // 60 segundos de validade

      if (error) {
        throw error;
      }

      // Abre a URL segura em uma nova aba do navegador
      window.open(data.signedUrl, '_blank');

    } catch (error: any) {
      toast.error("Não foi possível abrir o documento", {
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-2 text-gray-600">Todos os documentos acessíveis para você.</p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
          {error && <div className="text-red-600 p-4">Erro ao carregar documentos: {error.message}</div>}
          
          {documents && (
            <div>
              {documents.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 font-semibold">Nenhum documento encontrado</h3>
                  <p className="mt-1 text-sm">Comece fazendo o upload de um novo documento.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    // ATUALIZAÇÃO AQUI: Adicionamos o onClick e a classe do cursor
                    <li 
                      key={doc.id} 
                      className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {/* Futuramente, podemos ter um menu de ações aqui (download, delete, etc.) */}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
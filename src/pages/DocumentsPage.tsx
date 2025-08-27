// ARQUIVO FINAL E ATUALIZADO: src/pages/DocumentsPage.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, Document } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Folder, FileText } from 'lucide-react';

function useDocuments() {
  const { userInfo } = useAuth();
  return useQuery({
    queryKey: ['documents', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', userInfo.company_id)
        .eq('storage_provider', 'GOOGLE_DRIVE')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data as Document[]) || [];
    },
    enabled: !!userInfo?.company_id,
  });
}

export function DocumentsPage() {
  const { data: documents, isLoading, error } = useDocuments();

  // A Lógica do Link agora é muito mais simples!
  const getDriveLink = (doc: Document) => {
    // A Edge Function já nos dá a URL correta e completa.
    return doc.file_path;
  };

  if (isLoading) { /* ... spinner ... */ }
  if (error) { /* ... mensagem de erro ... */ }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Documentos</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Arquivos Sincronizados</h2>
        {!documents || documents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum arquivo encontrado.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc: any) => (
              <li key={doc.id} className="p-3 border rounded-md flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {doc.file_type === 'application/vnd.google-apps.folder' ? <Folder /> : <FileText />}
                  <p className="font-medium">{doc.name}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={getDriveLink(doc)} target="_blank" rel="noopener noreferrer">
                    Abrir no Drive
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
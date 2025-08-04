// ARQUIVO CORRIGIDO: src/pages/DocumentsPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'; // IMPORTANTE: Para a navegação
import { 
  FileText, Upload, Search, Filter, Download, Eye, Edit, Trash2,
  FolderPlus, MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatFileSize, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// Hook para buscar documentos
function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      // Usando a query direta que já sabemos que funciona com RLS
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Componente de card de documento (sem alterações)
interface DocumentCardProps {
  document: any;
  onAction: (action: string, document: any) => void;
}

function DocumentCard({ document, onAction }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'docx': case 'doc': return '📝';
      case 'xlsx': case 'xls': return '📊';
      case 'csv': return '📈';
      default: return '📎';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="text-2xl">{getFileIcon(document.file_type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {document.file_type?.toUpperCase()} • {formatFileSize(document.file_size)}
            </p>
            <p className="text-xs text-gray-500">
              Enviado em {formatDate(document.created_at)}
            </p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-md hover:bg-gray-100">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5" onMouseLeave={() => setShowMenu(false)}>
              <div className="py-1">
                <button onClick={() => onAction('view', document)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"><Eye className="mr-3 h-4 w-4" />Visualizar</button>
                <button onClick={() => onAction('download', document)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"><Download className="mr-3 h-4 w-4" />Download</button>
                <button onClick={() => onAction('edit', document)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"><Edit className="mr-3 h-4 w-4" />Editar</button>
                <button onClick={() => onAction('delete', document)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"><Trash2 className="mr-3 h-4 w-4" />Excluir</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DocumentsPage() {
  const { userInfo } = useAuth();
  const navigate = useNavigate(); // Hook para navegação
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const { data: documents, isLoading, error } = useDocuments();

  if (userInfo?.user_roles?.role_name === 'SUPERUSUARIO') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Acesso Restrito</h3>
        <p>Superusuários não têm acesso aos documentos das empresas.</p>
      </div>
    );
  }

  const handleDocumentAction = (action: string, document: any) => {
    if (action === 'download') {
      supabase.storage.from('documents').download(document.file_path).then(({ data, error }) => {
        if (error) toast.error("Erro ao baixar arquivo.");
        if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = document.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    } else {
      toast.info(`Funcionalidade de "${action}" em desenvolvimento`);
    }
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.file_type?.includes(filterType);
    return matchesSearch && matchesFilter;
  }) || [];

  const fileTypes = [...new Set(documents?.map(doc => doc.file_type).filter(Boolean) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-2 text-gray-600">Gerencie e organize seus documentos empresariais</p>
        </div>
        <div className="flex space-x-3">
          {/* BOTÃO CORRIGIDO */}
          <button onClick={() => navigate('/upload')} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Carregar
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
            <FolderPlus className="mr-2 h-4 w-4" />
            Nova Pasta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* ... (código da barra de busca e filtros permanece o mesmo) ... */}
      </div>

      {isLoading ? <LoadingSpinner size="lg" /> : 
       error ? <div className="text-red-500">Erro ao carregar documentos</div> :
       filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium">Nenhum documento</h3>
          <p className="mt-1 text-sm text-gray-500">Comece fazendo upload do seu primeiro documento</p>
        </div>
       ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} onAction={handleDocumentAction} />
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-4">
            <span>{filteredDocuments.length} documento(s) encontrado(s)</span>
          </div>
        </>
       )
      }
      
      {/* MODAL REMOVIDO */}
    </div>
  );
}
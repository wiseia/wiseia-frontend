import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  FolderPlus,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatFileSize, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

// Hook para buscar documentos
function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
  })
}

// Componente de card de documento
interface DocumentCardProps {
  document: any
  onAction: (action: string, document: any) => void
}

function DocumentCard({ document, onAction }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄'
      case 'docx':
      case 'doc':
        return '📝'
      case 'xlsx':
      case 'xls':
        return '📊'
      case 'csv':
        return '📈'
      default:
        return '📎'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="text-2xl">{getFileIcon(document.file_type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {document.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {document.file_type.toUpperCase()} • {formatFileSize(document.file_size)}
            </p>
            <p className="text-xs text-gray-500">
              Enviado em {formatDate(document.created_at)}
            </p>
            {document.description && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {document.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <button
                  onClick={() => {
                    onAction('view', document)
                    setShowMenu(false)
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="mr-3 h-4 w-4" />
                  Visualizar
                </button>
                <button
                  onClick={() => {
                    onAction('download', document)
                    setShowMenu(false)
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Download className="mr-3 h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    onAction('edit', document)
                    setShowMenu(false)
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="mr-3 h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onAction('delete', document)
                    setShowMenu(false)
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {document.tags && document.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {document.tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{document.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Modal de upload de documento
function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Selecione pelo menos um arquivo')
      return
    }

    setUploading(true)
    
    try {
      for (const file of files) {
        // Converter arquivo para base64
        const reader = new FileReader()
        const base64Data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        // Chamar edge function de upload
        const { data, error } = await supabase.functions.invoke('document-upload', {
          body: {
            fileData: base64Data,
            fileName: file.name,
            documentName: file.name.split('.')[0],
            description: '',
            tags: [],
          }
        })

        if (error) {
          toast.error(`Erro ao fazer upload de ${file.name}: ${error.message}`)
          continue
        }

        toast.success(`${file.name} enviado com sucesso!`)
      }
      
      // Fechar modal e limpar arquivos
      onClose()
      setFiles([])
      
      // Recarregar lista de documentos
      window.location.reload()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erro inesperado no upload')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload de Documentos
          </h3>
          
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300',
              files.length > 0 && 'border-green-400 bg-green-50'
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFileSelect(e.dataTransfer.files)
            }}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Selecionar Arquivos
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Arquivos selecionados:</p>
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600 flex justify-between">
                    <span>{file.name}</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DocumentsPage() {
  const { userInfo } = useAuth()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  
  const { data: documents, isLoading, error } = useDocuments()

  // Verificar se usuário pode acessar documentos
  if (userInfo?.role_name === 'SUPERUSER') {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">
          Superusuários não têm acesso aos documentos das empresas.
        </p>
      </div>
    )
  }

  const handleDocumentAction = (action: string, document: any) => {
    switch (action) {
      case 'view':
        toast.info('Funcionalidade de visualização em desenvolvimento')
        break
      case 'download':
        window.open(document.file_path, '_blank')
        break
      case 'edit':
        toast.info('Funcionalidade de edição em desenvolvimento')
        break
      case 'delete':
        if (confirm('Tem certeza que deseja excluir este documento?')) {
          toast.info('Funcionalidade de exclusão em desenvolvimento')
        }
        break
    }
  }

  // Filtrar documentos baseado na busca e filtro
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || doc.file_type === filterType
    return matchesSearch && matchesFilter
  }) || []

  // Obter tipos de arquivo únicos para o filtro
  const fileTypes = [...new Set(documents?.map(doc => doc.file_type) || [])]

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-2 text-gray-600">
            Gerencie e organize seus documentos empresariais
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
            <FolderPlus className="mr-2 h-4 w-4" />
            Nova Pasta
          </button>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os tipos</option>
              {fileTypes.map(type => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar documentos</h3>
          <p className="text-gray-600">Tente recarregar a página</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' ? 'Nenhum documento encontrado' : 'Nenhum documento'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Comece fazendo upload do seu primeiro documento'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onAction={handleDocumentAction}
            />
          ))}
        </div>
      )}

      {/* Estatísticas */}
      {filteredDocuments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{filteredDocuments.length} documento(s) encontrado(s)</span>
            <span>
              Tamanho total: {formatFileSize(
                filteredDocuments.reduce((sum, doc) => sum + doc.file_size, 0)
              )}
            </span>
          </div>
        </div>
      )}

      {/* Modal de upload */}
      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  )
}
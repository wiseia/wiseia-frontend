// ARQUIVO COMPLETO E CORRIGIDO: src/pages/UploadPage.tsx

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useUploadDocument } from '@/hooks/useUploadDocument';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface UploadFormData {
  title: string;
}

interface SelectedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { userInfo } = useAuth();
  const uploadMutation = useUploadDocument();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UploadFormData>();

  const titleValue = watch('title');
  const isFormReady = !!selectedFile && !!titleValue?.trim() && !uploadMutation.isPending;

  const allowedTypes = [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) return 'Tipo de arquivo não suportado. Use PDF, DOCX, XLSX ou CSV.';
    if (file.size > 52428800) return 'Arquivo muito grande. Tamanho máximo: 50MB.';
    return null;
  };

  const processFile = (file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }
    setSelectedFile({ file, name: file.name, size: file.size, type: file.type });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    if (e.dataTransfer.files?.length) processFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) processFile(e.target.files[0]); };
  const removeFile = () => setSelectedFile(null);
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('csv')) return '📉';
    return '📄';
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile.file,
        title: data.title.trim(),
      });

      toast.success('Documento enviado com sucesso!', {
        description: 'Você será redirecionado para a lista de documentos.',
        duration: 2000,
        onAutoClose: () => navigate('/documents'),
      });
      
      reset();
      setSelectedFile(null);

    } catch (error: any) {
      toast.error('Falha no upload', {
        description: error.message || 'Por favor, tente novamente.',
      });
    }
  };

  if (!userInfo) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erro de autenticação!</strong>
          <span className="block sm:inline"> Você precisa estar logado para enviar documentos.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload de Documentos</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo</label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
              onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            >
              <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadMutation.isPending} />
              {!selectedFile ? (
                <div className="space-y-2">
                  <Upload className="mx-auto w-10 h-10 text-gray-400" />
                  <p>Arraste e solte o arquivo aqui ou <span className="text-blue-600 font-medium">clique para selecionar</span></p>
                  <p className="text-xs text-gray-500">PDF, DOCX, XLSX, CSV (Max 50MB)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(selectedFile.type)}</span>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 truncate max-w-48">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                    </div>
                    <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-500" disabled={uploadMutation.isPending}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Título do Documento *</label>
            <input
              id="title" type="text" placeholder="Ex: Relatório Financeiro Q1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={uploadMutation.isPending}
              {...register('title', { required: 'Título é obrigatório' })}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/documents')}>
                Cancelar
            </Button>
            <Button type="submit" disabled={!isFormReady}>
              {uploadMutation.isPending ? (
                <><LoadingSpinner size="sm" className="mr-2" /> Enviando...</>
              ) : (
                'Enviar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
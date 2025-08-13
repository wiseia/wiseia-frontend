// ARQUIVO FINAL E CORRIGIDO: src/pages/DocumentsPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, MoreVertical, Eye, Download, Edit, Trash2, FolderPlus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Document } from '@/lib/supabase'; // Importe Document daqui
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Funções utilitárias (supondo que estejam em um arquivo utils)
const formatFileSize = (bytes: number) => { /* ... sua lógica ... */ return `${bytes} B`; };
const formatDate = (date: string) => new Date(date).toLocaleDateString();

// ... (Restante do código do DocumentCard e useDocuments)

export function DocumentsPage() {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  // ... (Restante do seu código de estado e hooks)

  // CORREÇÃO APLICADA AQUI
  if (userInfo?.role_name === 'SUPERUSUARIO') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Acesso Restrito</h3>
        <p>Superusuários não têm acesso aos documentos das empresas.</p>
      </div>
    );
  }

  // ... (O resto do seu componente DocumentsPage permanece o mesmo)
}
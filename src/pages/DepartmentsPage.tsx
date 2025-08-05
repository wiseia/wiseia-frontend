// ARQUIVO FINAL E CORRIGIDO: src/pages/DepartmentsPage.tsx (COM LÓGICA MANUAL)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateDepartmentModal } from './departments/CreateDepartmentModal';
import { EditDepartmentModal } from './departments/EditDepartmentModal';

// Hook simplificado para buscar os departamentos
function useAllDepartments() {
  const { userInfo } = useAuth();
  return useQuery({
    queryKey: ['departments', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase
        .from('departments')
        .select('*') // Busca todos os dados, sem join
        .eq('company_id', userInfo.company_id)
        .order('name');
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userInfo?.company_id,
  });
}

export function DepartmentsPage() {
  const { userInfo } = useAuth();
  const { data: departments, isLoading, error } = useAllDepartments();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const canManage = userInfo?.user_roles?.hierarchy_level <= 1;

  const handleEdit = (department: any) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };
  
  // NOVA LÓGICA: Criamos um mapa para encontrar os nomes dos pais facilmente
  const departmentMap = new Map(departments?.map(d => [d.id, d.name]));

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Erro ao carregar departamentos: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departamentos</h1>
          <p className="mt-2 text-gray-600">Gerencie os departamentos e divisões da sua empresa.</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Departamento
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments?.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* NOVA LÓGICA: Usamos o mapa para encontrar o nome do pai */}
                    {dept.parent_department_id 
                      ? `Divisão de "${departmentMap.get(dept.parent_department_id)}"` 
                      : 'Departamento Principal'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canManage && <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>Editar</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
        {departments?.length === 0 && (
           <p className="text-center text-gray-500 py-8">Nenhum departamento cadastrado.</p>
        )}
      </div>

      <CreateDepartmentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      {selectedDepartment && (
        <EditDepartmentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} department={selectedDepartment} />
      )}
    </div>
  );
}
// ARQUIVO FINAL E SEGURO: src/pages/DepartmentsPage.tsx

import React, { useState } from 'react';
import { MoreHorizontal, Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/Table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Department } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EditDepartmentModal } from './departments/EditDepartmentModal';

function useDepartments() {
  const { userInfo } = useAuth();
  return useQuery({
    queryKey: ['departments', userInfo?.company_id],
    queryFn: async () => {
      if (!userInfo?.company_id) return [];
      const { data, error } = await supabase.from('departments').select('*').eq('company_id', userInfo.company_id);
      if (error) throw new Error(error.message);
      return data as Department[] || []; // Garante que sempre retorne um array
    },
    enabled: !!userInfo?.company_id,
  });
}

export function DepartmentsPage() {
  const { userInfo } = useAuth();
  const { data: departments, isLoading, error } = useDepartments();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const userRoleLevel = userInfo?.user_roles?.hierarchy_level ?? 4;
  const canManage = userRoleLevel <= 1;

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  if (isLoading || !userInfo) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Erro ao carregar departamentos: {error.message}</div>;
  }
  
  // Acesso negado precisa vir DEPOIS do loading para ter o userInfo
  if (!canManage) {
    return (
      <div className="text-center p-8">
        <h1 className="text-xl font-bold text-red-600">Acesso Negado</h1>
        <p className="text-gray-600 mt-2">Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Departamentos</h1>
          </div>
          {canManage && <Button><Plus className="mr-2 h-4 w-4" /> Novo Departamento</Button>}
        </div>
        <Card>
          <CardHeader><CardTitle>Departamentos ({departments?.length || 0})</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* ========================================================== */}
                  {/* CORREÇÃO DE SEGURANÇA APLICADA AQUI */}
                  {/* Só tentamos renderizar a tabela se 'departments' for um array */}
                  {/* ========================================================== */}
                  {departments && departments.length > 0 ? (
                    departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell><div className="font-medium">{department.name}</div></TableCell>
                        <TableCell>{department.created_at ? formatDate(department.created_at) : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {canManage && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(department)}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        Nenhum departamento encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditDepartmentModal 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        department={selectedDepartment}
      />
    </>
  );
}
// ARQUIVO FINAL, COM A IMPORTAÇÃO CORRIGIDA: src/pages/UsersPage.tsx

import React, { useState } from "react";
import { formatDate, getInitials } from "@/lib/utils";
import { MoreHorizontal, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { FullUserInfo } from "@/lib/supabase";
// ### CAMINHO DA IMPORTAÇÃO CORRIGIDO PARA MAIÚSCULO ###
import { EditUserModal } from "./users/EditUserModal";

export function UsersPage() {
  // (O resto do código é o mesmo da mensagem anterior, sem alterações)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<FullUserInfo | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { userInfo } = useAuth();
  const { data: users, isLoading, error } = useUsers();

  const handleEditUser = (user: FullUserInfo) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const filteredUsers = users?.filter((user: FullUserInfo) => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading || !userInfo) {
    return <div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div>;
  }
  if (error) {
    return <div className="text-red-500 p-4">Erro ao carregar usuários: {error.message}</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <Button onClick={() => alert('Funcionalidade "Novo Usuário" a ser implementada.')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <div className="border rounded-lg bg-white p-4">
          <div className="flex-1 relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>{getInitials(user.full_name || 'U')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{user.user_roles?.role_name}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? formatDate(user.created_at) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">⋮</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={selectedUser}
      />
    </>
  );
}
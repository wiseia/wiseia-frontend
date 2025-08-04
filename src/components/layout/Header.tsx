// ARQUIVO CORRIGIDO: src/components/layout/Header.tsx

import { useState } from 'react'
import { Bell, Menu, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
// As funções 'getRoleDisplayName' e 'getInitials' provavelmente não existem, então vamos usar os dados diretamente por enquanto
// import { getRoleDisplayName, getInitials } from '@/lib/utils'

export function Header() {
  const { userInfo, signOut } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Função simples para pegar iniciais
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?'
    const names = name.split(' ')
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }


  if (!userInfo || !userInfo.user_roles) {
    // Adicionamos uma verificação extra para garantir que user_roles existe
    return null
  }

  // CORREÇÃO AQUI: Pegamos o nome do papel do objeto aninhado
  const roleName = userInfo.user_roles.role_name;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Botão do menu mobile */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Barra de busca */}
          <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-start">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Buscar
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border-0 bg-gray-50 py-1.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Buscar documentos..."
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Ver notificações</span>
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Menu do perfil */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="sr-only">Abrir menu do usuário</span>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {getInitials(userInfo.full_name)}
                  </span>
                </div>
                <span className="hidden ml-2 text-sm font-medium text-gray-700 lg:block">
                  {userInfo.full_name}
                </span>
                <ChevronDown className="hidden ml-1 h-4 w-4 text-gray-400 lg:block" />
              </button>

              {/* Dropdown do perfil */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                  onMouseLeave={() => setShowProfileMenu(false)} // Para fechar o menu ao tirar o mouse
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userInfo.full_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {/* CORREÇÃO AQUI */}
                      {roleName.toLowerCase()}
                    </p>
                  </div>
                  {/* CORREÇÃO AQUI: Envolvemos o botão em um 'div' para melhor comportamento */}
                  <div>
                    <button
                      onClick={async () => {
                        await signOut();
                        setShowProfileMenu(false); // Fecha o menu após clicar
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
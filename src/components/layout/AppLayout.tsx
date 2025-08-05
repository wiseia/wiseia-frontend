// ARQUIVO CORRIGIDO: src/components/layout/AppLayout.tsx

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar'; // Certifique-se que o nome do arquivo é Sidebar.tsx
import { Header } from './Header';   // Certifique-se que o nome do arquivo é Header.tsx

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* O conteúdo da rota atual será renderizado aqui */}
        </main>
      </div>
    </div>
  );
}
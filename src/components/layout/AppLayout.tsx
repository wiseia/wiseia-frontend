// ARQUIVO CORRIGIDO: src/components/layout/AppLayout.tsx

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar'; // Caminho relativo correto
import { Header } from './Header';   // Caminho relativo correto

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
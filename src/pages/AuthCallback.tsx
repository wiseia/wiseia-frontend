// ARQUIVO FINAL, COM A ESTRATÉGIA PASSIVA: src/pages/AuthCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Apenas "ouvimos" por mudanças no estado de autenticação.
    // O supabase-js, com 'detectSessionInUrl', fará a troca do código nos bastidores.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      // 2. Se o evento for 'SIGNED_IN', significa que a troca foi um sucesso.
      if (event === "SIGNED_IN" && session) {
        toast.success("Conectado com sucesso!");
        navigate("/dashboard", { replace: true });
      }
    });

    // 3. Fallback de Segurança para evitar spinner infinito.
    const fallbackTimeout = setTimeout(() => {
      toast.error("A autenticação demorou demais. Tente novamente.");
      navigate("/login", { replace: true });
    }, 10000); // 10 segundos

    // 4. Limpeza
    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [navigate]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <LoadingSpinner size="lg" />
      <h1 className="mt-6 text-xl font-semibold text-gray-700">
        Finalizando autenticação...
      </h1>
    </div>
  );
}
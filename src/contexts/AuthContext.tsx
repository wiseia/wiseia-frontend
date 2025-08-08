// ARQUIVO FINAL E MAIS ROBUSTO: src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, FullUserInfo } from '@/lib/supabase';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthContextType {
  user: SupabaseUser | null;
  userInfo: FullUserInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userInfo, setUserInfo] = useState<FullUserInfo | null>(null);
  // O estado de loading agora é fundamental
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar o perfil do usuário da nossa tabela 'users'
    const fetchUserProfile = async (authUser: SupabaseUser) => {
      try {
        const { data, error } = await supabase.rpc('get_my_profile');
        if (error) throw error;
        if (data && data.length > 0) {
          setUserInfo(data[0] as FullUserInfo);
        } else {
          // Se não encontrar o perfil, é um estado válido, mas userInfo será null
          setUserInfo(null);
          console.warn("Perfil de usuário não encontrado na tabela 'users'.");
        }
      } catch (error) {
        console.error("Erro ao buscar perfil com RPC:", error);
        setUserInfo(null); // Em caso de erro, garante que userInfo fique nulo
      }
    };

    const processSession = async (session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Se existe um usuário logado, BUSCA o perfil antes de parar de carregar
        await fetchUserProfile(currentUser);
      } else {
        // Se não há usuário, não há perfil para buscar
        setUserInfo(null);
      }
      
      // SÓ PARA DE CARREGAR DEPOIS DE TODO O PROCESSO
      setLoading(false);
    };

    // Verificação inicial da sessão no primeiro carregamento
    supabase.auth.getSession().then(({ data: { session } }) => {
      processSession(session);
    });

    // Listener para futuras mudanças de estado (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      processSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserInfo(null);
  };
  
  // Note que removemos handleGoogleCallback, pois não estava sendo usado.
  // Se precisar dele, podemos adicionar de volta.
  const value = { user, userInfo, loading, signIn, signOut };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
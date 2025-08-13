// ARQUIVO FINAL, ROBUSTO E À PROVA DE FALHAS: src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, FullUserInfo, UserRole } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AuthContextType {
  user: SupabaseUser | null;
  userInfo: FullUserInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userInfo, setUserInfo] = useState<FullUserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authUser: SupabaseUser | null): Promise<FullUserInfo | null> => {
    if (!authUser) return null;
    try {
      const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (userError) throw userError;
      
      const { data: roleData, error: roleError } = await supabase.from('user_roles').select('*').eq('id', userData.role_id).single();
      if (roleError) throw roleError;
      
      return { ...userData, user_roles: roleData as UserRole };
    } catch (err: any) {
      console.error("Erro ao buscar perfil:", err.message);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let authListener: any = null;

    // Função auto-executável para lidar com a verificação inicial
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setUser(session?.user ?? null);
        const profile = await fetchUserProfile(session?.user ?? null);
        if (!isMounted) return;
        setUserInfo(profile);
        
      } catch (err) {
        if (isMounted) setUserInfo(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'INITIAL_SESSION') return;
          if (!isMounted) return;

          setUser(session?.user ?? null);
          const profile = await fetchUserProfile(session?.user ?? null);
          setUserInfo(profile);
        }
      );
      authListener = listener;
    })();

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { user, userInfo, loading, signIn, signOut };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
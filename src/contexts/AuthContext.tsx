// ARQUIVO FINAL E SIMPLIFICADO: src/contexts/AuthContext.tsx

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
    // Apenas verifica a sessão ao carregar a primeira vez
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      const profile = await fetchUserProfile(session?.user ?? null);
      setUserInfo(profile);
      setLoading(false);
    };

    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      // Após o login, busca os dados manualmente
      setUser(data.user);
      const profile = await fetchUserProfile(data.user);
      setUserInfo(profile);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Limpa o estado manualmente
    setUser(null);
    setUserInfo(null);
  };

  const value = { user, userInfo, loading, signIn, signOut };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
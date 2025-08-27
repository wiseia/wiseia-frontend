// ARQUIVO FINAL, COMPLETO E DEFINITIVO: src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// =================================================================
// 1. EXPORTAÇÃO DO CLIENTE SUPABASE (A PARTE QUE FALTAVA)
// =================================================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});


// =================================================================
// 2. EXPORTAÇÃO DE TODOS OS TIPOS NECESSÁRIOS
// =================================================================

export interface UserRole {
  id: number;
  role_name: string;
  hierarchy_level: number;
}

export interface Department {
  id: string;
  name: string;
  company_id: string;
  parent_department_id: string | null;
  created_at: string;
}

export interface FullUserInfo {
  id: string;
  full_name: string | null;
  email: string | null;
  company_id: string | null;
  department_id: string | null;
  avatar_url: string | null;
  created_at: string;
  status: string | null;
  user_roles: UserRole | null;
  company_name?: string;
}

// Interface 'Document' completa
export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}
// ARQUIVO FINAL E CORRETO: src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não definidas.')
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- TIPOS DE DADOS ---
export interface UserRole {
  id: number;
  role_name: string;
  hierarchy_level: number;
}

export interface Document {
  id: string;
  name: string;
  file_type: string;
  created_at: string;
  file_size: number;
}

export interface UserProfile {
  id: string;
  company_id: string | null;
  department_id: string | null;
  role_id: number | null;
  email: string;
  full_name: string | null;
}

// A interface que combina o perfil com o papel
export interface FullUserInfo extends UserProfile {
  user_roles: UserRole;
}
// ARQUIVO FINAL E CORRETO: src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) { throw new Error('Variáveis de ambiente do Supabase não definidas.'); }
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TIPOS DE DADOS ---

export interface UserRole { id: number; role_name: string; hierarchy_level: number; }

// INTERFACE DOCUMENT COMPLETA E CORRIGIDA
export interface Document {
  id: string;
  name: string;
  file_path: string; // <-- A PROPRIEDADE QUE FALTAVA
  file_type: string;
  created_at: string;
  file_size: number;
  company_id: string;
  department_id: string | null;
  uploaded_by: string;
  storage_provider: string;
}

export interface Department { id: string; name: string; parent_department_id: string | null; }

export interface UserProfile {
  id: string;
  company_id: string | null;
  department_id: string | null;
  role_id: number | null;
  email: string;
  full_name: string | null;
}

export interface FullUserInfo extends UserProfile {
  user_roles: UserRole;
  hierarchy_level: number;
  role_name: string;
}
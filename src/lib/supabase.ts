// ARQUIVO CORRIGIDO: src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

// 1. Configuração do Cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam ser definidas.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Tipos TypeScript ATUALIZADOS para o nosso NOVO e CORRIGIDO schema

export interface UserRole {
  id: number
  role_name: string
  hierarchy_level: number
}

export interface Company {
  id: string
  name: string
  created_at: string
}

export interface Department {
  id: string
  company_id: string
  name: string
  created_at: string
}

export interface UserProfile {
  id: string // UUID do usuário na tabela 'users'
  auth_id: string // UUID do usuário na tabela 'auth.users'
  company_id: string | null
  department_id: string | null
  role_id: number | null
  email: string
  full_name: string | null
}

export interface Document {
  id: string
  company_id: string
  department_id: string | null
  name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: string
  created_at: string
}

// 3. Informações do Usuário Logado (UserInfo) - Objeto que combina tudo
export interface FullUserInfo extends UserProfile {
  user_roles: UserRole | null; // O objeto completo do papel do usuário
}
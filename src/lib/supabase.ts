import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para o sistema
export interface User {
  id: string
  auth_id: string
  company_id: string | null
  department_id: string | null
  role_id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  status: string
  permissions: Record<string, any>
  last_login: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: number
  role_name: string
  hierarchy_level: number
  description: string
  created_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  industry: string | null
  address: Record<string, any> | null
  contact_info: Record<string, any> | null
  status: string
  max_storage_gb: number
  subscription_plan: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  company_id: string
  name: string
  description: string | null
  parent_department_id: string | null
  manager_id: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  company_id: string
  department_id: string | null
  folder_id: string | null
  name: string
  description: string | null
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  mime_type: string | null
  tags: string[]
  metadata: Record<string, any>
  permissions: Record<string, any>
  uploaded_by: string
  version: number
  status: string
  created_at: string
  updated_at: string
}

export interface UserInfo {
  user_id: string
  company_id: string | null
  department_id: string | null
  role_name: string
  hierarchy_level: number
  full_name: string
}

// Função helper para obter informações do usuário atual
export async function getCurrentUserInfo(): Promise<UserInfo | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Auth user:', user)
    if (error || !user) {
      console.log('No authenticated user:', error)
      return null
    }

    // Tentar buscar diretamente da tabela users primeiro
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        company_id,
        department_id,
        first_name,
        last_name,
        user_roles!inner(
          role_name,
          hierarchy_level
        )
      `)
      .eq('auth_id', user.id)
      .single()
    
    console.log('Direct user query result:', { userData, userError })
    
    if (userError || !userData) {
      console.log('Direct query failed, trying RPC...')
      
      // Fallback para RPC
      const { data, error: rpcError } = await supabase.rpc('get_current_user_info')
      console.log('RPC result:', { data, error: rpcError })
      if (rpcError || !data || data.length === 0) {
        console.log('RPC error or no data:', rpcError)
        return null
      }
      return data[0] as UserInfo
    }

    // Construir UserInfo a partir dos dados diretos
    const userInfo: UserInfo = {
      user_id: userData.id,
      company_id: userData.company_id,
      department_id: userData.department_id,
      role_name: (userData.user_roles as any)?.role_name,
      hierarchy_level: (userData.user_roles as any)?.hierarchy_level,
      full_name: `${userData.first_name} ${userData.last_name}`
    }
    
    console.log('User info constructed:', userInfo)
    return userInfo
  } catch (error) {
    console.error('Error getting user info:', error)
    return null
  }
}

// Função helper para verificar permissões
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

// Função helper para verificar hierarquia
export function hasHigherOrEqualLevel(userLevel: number, requiredLevel: number): boolean {
  return userLevel <= requiredLevel // Níveis menores = hierarquia maior
}
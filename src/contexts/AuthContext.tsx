import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, UserInfo, getCurrentUserInfo } from '@/lib/supabase'
import { toast } from 'sonner'

interface AuthContextType {
  session: Session | null
  user: SupabaseUser | null
  userInfo: UserInfo | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserInfo = async () => {
    if (user) {
      const info = await getCurrentUserInfo()
      setUserInfo(info)
    } else {
      setUserInfo(null)
    }
  }

  // Carregar usuário na inicialização
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          return
        }
        
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          await refreshUserInfo()
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user && event === 'SIGNED_IN') {
          await refreshUserInfo()
        } else if (event === 'SIGNED_OUT') {
          setUserInfo(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        toast.error(`Erro no login: ${error.message}`)
        throw error
      }
      
      toast.success('Login realizado com sucesso!')
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
        }
      })
      
      if (error) {
        toast.error(`Erro no cadastro: ${error.message}`)
        throw error
      }
      
      toast.success('Cadastro realizado! Verifique seu email para confirmação.')
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error(`Erro no logout: ${error.message}`)
        throw error
      }
      
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    session,
    user,
    userInfo,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserInfo,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
// ARQUIVO CORRIGIDO: src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, FullUserInfo } from '@/lib/supabase' // Tipos atualizados
import { toast } from 'sonner'

interface AuthContextType {
  session: Session | null
  user: SupabaseUser | null
  userInfo: FullUserInfo | null // Usando nossa nova interface
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
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
  const [userInfo, setUserInfo] = useState<FullUserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async (authUser: SupabaseUser) => {
      const { data, error } = await supabase
        .from('users')
        .select(`*, user_roles (*)`)
        .eq('auth_id', authUser.id)
        .single()

      if (error) {
        toast.error("Não foi possível carregar os dados do seu perfil.")
        console.error("Error fetching profile:", error)
        setUserInfo(null)
      } else {
        setUserInfo(data as FullUserInfo)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUserInfo(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Esta função só faz o login, ela não mostra toasts.
    // A página de login será responsável por isso.
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) toast.error(error.message)
  }

  const value = { session, user, userInfo, loading, signIn, signOut }

  return (
    <AuthContext.Provider value={value}>
      { !loading && children }
    </AuthContext.Provider>
  )
}
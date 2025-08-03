import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'sonner'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            toast.error('Erro na autenticação: ' + error.message)
            navigate('/login?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            toast.success('Login realizado com sucesso!')
            navigate('/dashboard')
            return
          }
        }

        // Se chegou aqui, algo deu errado
        toast.error('Sessão não encontrada')
        navigate('/login?error=No session found')
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Erro inesperado na autenticação')
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processando autenticação...
        </h2>
        <p className="text-gray-600">
          Aguarde enquanto validamos suas credenciais.
        </p>
      </div>
    </div>
  )
}
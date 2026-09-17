import { GoogleLogin } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { loginWithGoogle } from '@/features/auth/api'
import { useAuth } from '@/features/auth/useAuth'
import { getApiError } from '@/lib/apiError'

const GOOGLE_TOKEN_INVALID_MESSAGE = 'Não foi possível entrar com o Google. Tente novamente.'
const GENERIC_GOOGLE_ERROR = 'Não foi possível concluir o login com o Google. Tente novamente em instantes.'

function GoogleLoginButton() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
      auth.login(data.token, { accountCreated: data.accountCreated })
      navigate('/perfil')
    },
    onError: (mutationError) => {
      const apiError = getApiError(mutationError)

      if (apiError?.error === 'GOOGLE_TOKEN_INVALID') {
        setError(GOOGLE_TOKEN_INVALID_MESSAGE)
        return
      }

      setError(GENERIC_GOOGLE_ERROR)
    },
  })

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Falha ao entrar com Google</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GoogleLogin
        theme="outline"
        text="continue_with"
        shape="rectangular"
        width="320"
        onSuccess={(credentialResponse) => {
          if (!credentialResponse.credential) {
            return
          }
          setError(null)
          mutation.mutate({ idToken: credentialResponse.credential })
        }}
        // O SDK do Google chama onError tanto para falhas do cliente quanto
        // quando o usuário fecha/cancela a janela de seleção de conta, sem
        // distinguir os casos. Como o cancelamento não é um erro do backend,
        // nenhuma mensagem de falha é exibida aqui (ver spec - "Usuário
        // cancela a seleção de conta Google").
        onError={() => setError(null)}
      />
    </div>
  )
}

export default GoogleLoginButton

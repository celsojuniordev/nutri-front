import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getMe, logout as logoutRequest } from '@/features/auth/api'
import { useAuth } from '@/features/auth/useAuth'

function ProfilePage() {
  const navigate = useNavigate()
  const auth = useAuth()
  // Sinalizado pelo login via Google quando a conta foi criada naquela chamada;
  // o estado vive apenas em memória e é limpo no próximo login ou logout.
  const { accountJustCreated } = auth

  const profileQuery = useQuery({
    queryKey: ['nutritionist', 'me'],
    queryFn: getMe,
    retry: false,
  })

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    // A sessão local é encerrada independentemente do resultado da chamada ao
    // backend: mesmo que o logout remoto falhe, o cliente não deve continuar
    // com um token ativo.
    onSettled: () => {
      auth.logout()
      navigate('/login', { replace: true })
    },
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-8">
      {accountJustCreated && (
        <Alert>
          <AlertTitle>Conta criada com sucesso. Bem-vindo(a) à Evolvitta!</AlertTitle>
        </Alert>
      )}

      <h1 className="font-heading text-2xl font-bold text-neutral-900">Meu perfil</h1>

      {profileQuery.isPending && <p className="text-sm text-neutral-600">Carregando perfil…</p>}

      {profileQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar o perfil</AlertTitle>
          <AlertDescription>
            Tente novamente em instantes. Sua sessão continua ativa.
          </AlertDescription>
        </Alert>
      )}

      {profileQuery.data && (
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Nome</dt>
            <dd className="text-base text-neutral-900">{profileQuery.data.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">E-mail</dt>
            <dd className="text-base text-neutral-900">{profileQuery.data.email}</dd>
          </div>
          {profileQuery.data.company && (
            <div>
              <dt className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">
                Empresa
              </dt>
              <dd className="text-base text-neutral-900">{profileQuery.data.company}</dd>
            </div>
          )}
        </dl>
      )}

      <Button
        type="button"
        variant="destructive"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? 'Saindo…' : 'Sair'}
      </Button>
    </div>
  )
}

export default ProfilePage

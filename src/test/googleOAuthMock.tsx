import type { ReactNode } from 'react'

/**
 * Mock do SDK do Google Identity Services usado nos testes de componente:
 * o botão real é renderizado pelo Google em um iframe, que não funciona em
 * jsdom. Os dois botões abaixo permitem simular a seleção de uma conta
 * (sucesso, com idToken) e o cancelamento da janela de seleção.
 */
export function GoogleOAuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function GoogleLogin({
  onSuccess,
  onError,
}: {
  onSuccess: (response: { credential?: string }) => void
  onError: () => void
}) {
  return (
    <div>
      <button type="button" onClick={() => onSuccess({ credential: 'google-id-token' })}>
        simular conta google selecionada
      </button>
      <button type="button" onClick={() => onError()}>
        simular cancelamento
      </button>
    </div>
  )
}

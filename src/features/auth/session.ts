const TOKEN_STORAGE_KEY = 'evolvitta.auth.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Notificação de sessão expirada/invalidada, usada pelo interceptor de resposta
 * do client HTTP (fora da árvore React) para avisar quem gerencia o roteamento
 * (useAuth) que deve redirecionar para a tela de login. Ver design.md -
 * "Expiração de sessão".
 */
type SessionExpiredListener = () => void

const sessionExpiredListeners = new Set<SessionExpiredListener>()

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener)
  return () => sessionExpiredListeners.delete(listener)
}

export function notifySessionExpired(): void {
  for (const listener of sessionExpiredListeners) {
    listener()
  }
}

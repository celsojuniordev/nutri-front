import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearToken, getToken, onSessionExpired, setToken } from '@/features/auth/session'

interface LoginOptions {
  accountCreated?: boolean
}

interface AuthContextValue {
  isAuthenticated: boolean
  /** Verdadeiro quando a sessão atual nasceu de uma conta criada agora (login via Google). */
  accountJustCreated: boolean
  login: (token: string, options?: LoginOptions) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [accountJustCreated, setAccountJustCreated] = useState(false)

  useEffect(
    () =>
      onSessionExpired(() => {
        setTokenState(null)
        setAccountJustCreated(false)
      }),
    [],
  )

  const login = useCallback((newToken: string, options?: LoginOptions) => {
    setToken(newToken)
    setTokenState(newToken)
    setAccountJustCreated(options?.accountCreated ?? false)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setAccountJustCreated(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: token !== null,
      accountJustCreated,
      login,
      logout,
    }),
    [token, accountJustCreated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocado com seu Provider, padrão comum de contexto React
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/lib/env'
import { clearToken, getToken, notifySessionExpired } from '@/features/auth/session'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

function wasAuthenticatedRequest(config: InternalAxiosRequestConfig | undefined): boolean {
  return Boolean(config?.headers?.get('Authorization'))
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isSessionExpired = error.response?.status === 401 && wasAuthenticatedRequest(error.config)

    // Só reage se a sessão ainda não tiver sido limpa por uma chamada 401
    // concorrente anterior, evitando múltiplos redirecionamentos duplicados.
    if (isSessionExpired && getToken() !== null) {
      clearToken()
      notifySessionExpired()
    }

    return Promise.reject(error)
  },
)

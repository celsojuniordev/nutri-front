import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { getMe, logout as logoutRequest } from '@/features/auth/api'
import { setToken } from '@/features/auth/session'
import { AuthProvider } from '@/features/auth/useAuth'

vi.mock('@/features/auth/api', () => ({
  getMe: vi.fn(),
  logout: vi.fn(),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  register: vi.fn(),
}))

vi.mock('@react-oauth/google', async () => await import('@/test/googleOAuthMock'))

const mockedGetMe = vi.mocked(getMe)
const mockedLogout = vi.mocked(logoutRequest)

function renderAppAtProfile() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/perfil']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setToken('jwt-123')
  })

  it('shows the authenticated nutritionist profile', async () => {
    mockedGetMe.mockResolvedValueOnce({
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      company: 'Clínica Vida',
    })

    renderAppAtProfile()

    expect(await screen.findByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('Clínica Vida')).toBeInTheDocument()
  })

  it('omits the company field when the nutritionist has no company', async () => {
    mockedGetMe.mockResolvedValueOnce({ id: 1, name: 'Ana Silva', email: 'ana@example.com' })

    renderAppAtProfile()

    expect(await screen.findByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.queryByText('Empresa')).not.toBeInTheDocument()
  })

  it('shows a generic error without ending the session when loading the profile fails', async () => {
    mockedGetMe.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500, data: { status: 500, error: 'SERVER_ERROR', message: 'boom' } },
    })

    renderAppAtProfile()

    expect(await screen.findByText(/não foi possível carregar o perfil/i)).toBeInTheDocument()
    // A sessão permanece ativa e o usuário continua na rota protegida.
    expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument()
    expect(localStorage.getItem('evolvitta.auth.token')).toBe('jwt-123')
  })

  it('logs out, clears the local session and redirects to login', async () => {
    const user = userEvent.setup()
    mockedGetMe.mockResolvedValueOnce({ id: 1, name: 'Ana Silva', email: 'ana@example.com' })
    mockedLogout.mockResolvedValueOnce(undefined)

    renderAppAtProfile()
    await screen.findByText('Ana Silva')

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    await waitFor(() => expect(mockedLogout).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument())
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })

  it('clears the local session even when the logout request fails', async () => {
    const user = userEvent.setup()
    mockedGetMe.mockResolvedValueOnce({ id: 1, name: 'Ana Silva', email: 'ana@example.com' })
    mockedLogout.mockRejectedValueOnce(new Error('Network Error'))

    renderAppAtProfile()
    await screen.findByText('Ana Silva')

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument())
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })

  it('denies access to the protected route again after logout (including back navigation)', async () => {
    const user = userEvent.setup()
    mockedGetMe.mockResolvedValueOnce({ id: 1, name: 'Ana Silva', email: 'ana@example.com' })
    mockedLogout.mockResolvedValueOnce(undefined)

    const { unmount } = renderAppAtProfile()
    await screen.findByText('Ana Silva')
    await user.click(screen.getByRole('button', { name: 'Sair' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument())
    unmount()

    // Simula o "voltar" do navegador para a rota protegida após o logout.
    renderAppAtProfile()

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument()
  })
})

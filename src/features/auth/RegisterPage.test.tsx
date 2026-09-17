import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { register as registerNutritionist } from '@/features/auth/api'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import { AuthProvider } from '@/features/auth/useAuth'

vi.mock('@/features/auth/api', () => ({
  register: vi.fn(),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
}))

vi.mock('@react-oauth/google', async () => await import('@/test/googleOAuthMock'))

const mockedRegister = vi.mocked(registerNutritionist)

function renderRegisterPage() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/cadastro']}>
          <Routes>
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>, company?: string) {
  await user.type(screen.getByLabelText('Nome completo'), 'Ana Silva')
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'Senha123')
  if (company) {
    await user.type(screen.getByLabelText(/Empresa/), company)
  }
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocks submission while required fields are empty', () => {
    renderRegisterPage()

    expect(screen.getByRole('button', { name: /criar conta/i })).toBeDisabled()
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('registers successfully without a company and redirects to login', async () => {
    const user = userEvent.setup()
    mockedRegister.mockResolvedValueOnce({ id: 1, name: 'Ana Silva', email: 'ana@example.com' })
    renderRegisterPage()

    await fillValidForm(user)
    await waitFor(() => expect(screen.getByRole('button', { name: /criar conta/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => expect(mockedRegister).toHaveBeenCalled())
    expect(mockedRegister.mock.calls[0][0]).toEqual({
      name: 'Ana Silva',
      email: 'ana@example.com',
      password: 'Senha123',
      company: undefined,
    })
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument())
  })

  it('registers successfully with a company and redirects to login', async () => {
    const user = userEvent.setup()
    mockedRegister.mockResolvedValueOnce({
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      company: 'Clínica Vida',
    })
    renderRegisterPage()

    await fillValidForm(user, 'Clínica Vida')
    await waitFor(() => expect(screen.getByRole('button', { name: /criar conta/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => expect(mockedRegister).toHaveBeenCalled())
    expect(mockedRegister.mock.calls[0][0]).toEqual({
      name: 'Ana Silva',
      email: 'ana@example.com',
      password: 'Senha123',
      company: 'Clínica Vida',
    })
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument())
  })

  it('shows an email-scoped error when the server rejects a duplicate email (409)', async () => {
    const user = userEvent.setup()
    mockedRegister.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          status: 409,
          error: 'EMAIL_ALREADY_IN_USE',
          message: 'E-mail já cadastrado',
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    })
    renderRegisterPage()

    await fillValidForm(user)
    await waitFor(() => expect(screen.getByRole('button', { name: /criar conta/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(await screen.findByText(/já está em uso/i)).toBeInTheDocument()
    // Os demais campos permanecem preenchidos.
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Silva')
  })

  it('shows per-field errors when the server responds with VALIDATION_ERROR (400)', async () => {
    const user = userEvent.setup()
    mockedRegister.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          status: 400,
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: [{ field: 'email', message: 'formato de e-mail inválido' }],
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    })
    renderRegisterPage()

    await fillValidForm(user)
    await waitFor(() => expect(screen.getByRole('button', { name: /criar conta/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(await screen.findByText('formato de e-mail inválido')).toBeInTheDocument()
  })

  it('shows a generic error and preserves form data on network/unmapped failures', async () => {
    const user = userEvent.setup()
    mockedRegister.mockRejectedValueOnce(new Error('Network Error'))
    renderRegisterPage()

    await fillValidForm(user)
    await waitFor(() => expect(screen.getByRole('button', { name: /criar conta/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(await screen.findByText(/não foi possível criar sua conta/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Silva')
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com')
  })
})

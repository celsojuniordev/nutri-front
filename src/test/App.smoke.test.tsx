import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { AuthProvider } from '@/features/auth/useAuth'

vi.mock('@react-oauth/google', async () => await import('@/test/googleOAuthMock'))

describe('App', () => {
  it('renders a trivial component tree without crashing', () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <App />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })
})

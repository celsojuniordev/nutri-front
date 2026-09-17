import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from '@/features/auth/useAuth'
import { setToken } from '@/features/auth/session'

function Probe() {
  const { isAuthenticated } = useAuth()
  return <div>{isAuthenticated ? 'authenticated' : 'anonymous'}</div>
}

describe('useAuth hydration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reflects an authenticated state hydrated from a pre-existing token in localStorage', () => {
    setToken('jwt-123')

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByText('authenticated')).toBeInTheDocument()
  })

  it('reflects an anonymous state when there is no pre-existing token', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })
})

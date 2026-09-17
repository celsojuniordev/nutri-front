import { beforeEach, describe, expect, it } from 'vitest'
import { clearToken, getToken, setToken } from './session'

describe('session', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no token was ever saved', () => {
    expect(getToken()).toBeNull()
  })

  it('returns the token that was saved', () => {
    setToken('jwt-123')
    expect(getToken()).toBe('jwt-123')
  })

  it('overwrites a previously saved token', () => {
    setToken('jwt-123')
    setToken('jwt-456')
    expect(getToken()).toBe('jwt-456')
  })

  it('removes the token on clear', () => {
    setToken('jwt-123')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

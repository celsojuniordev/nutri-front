import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from '@/features/auth/schemas'

const validPayload = {
  name: 'Ana Silva',
  email: 'ana@example.com',
  password: 'Senha123',
  company: 'Clínica Vida',
}

describe('registerSchema', () => {
  it('accepts a fully valid payload with company', () => {
    const result = registerSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('accepts a valid payload without company (treated as absent)', () => {
    const withoutCompany = {
      name: validPayload.name,
      email: validPayload.email,
      password: validPayload.password,
    }
    const result = registerSchema.safeParse(withoutCompany)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.company).toBeUndefined()
    }
  })

  it('treats an empty company string as absent (accepted)', () => {
    const result = registerSchema.safeParse({ ...validPayload, company: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.company).toBeUndefined()
    }
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...validPayload, password: 'Ab1' })
    expect(result.success).toBe(false)
  })

  it('rejects a password without both a letter and a number', () => {
    const result = registerSchema.safeParse({ ...validPayload, password: 'onlyletters' })
    expect(result.success).toBe(false)
  })

  it('rejects a password longer than 72 characters', () => {
    const result = registerSchema.safeParse({ ...validPayload, password: `Ab1${'a'.repeat(70)}` })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email format', () => {
    const result = registerSchema.safeParse({ ...validPayload, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a name made only of whitespace as a required-field error', () => {
    const result = registerSchema.safeParse({ ...validPayload, name: '   ' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameIssue = result.error.issues.find((issue) => issue.path[0] === 'name')
      expect(nameIssue?.message).toMatch(/obrigatório/i)
    }
  })

  it('rejects a company made only of whitespace as an invalid-value error (not treated as absent)', () => {
    const result = registerSchema.safeParse({ ...validPayload, company: '   ' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const companyIssue = result.error.issues.find((issue) => issue.path[0] === 'company')
      expect(companyIssue?.message).toMatch(/espaços/i)
    }
  })

  it('rejects a name longer than 255 characters', () => {
    const result = registerSchema.safeParse({ ...validPayload, name: 'a'.repeat(256) })
    expect(result.success).toBe(false)
  })

  it('rejects a company longer than 255 characters', () => {
    const result = registerSchema.safeParse({ ...validPayload, company: 'a'.repeat(256) })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts a valid email/password payload', () => {
    const result = loginSchema.safeParse({ email: 'ana@example.com', password: 'Senha123' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Senha123' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'ana@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

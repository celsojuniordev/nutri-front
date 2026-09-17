import { z } from 'zod'

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d).+$/

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z
    .string()
    .trim()
    .min(1, 'E-mail é obrigatório')
    .email('Informe um e-mail em um formato válido'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .max(72, 'A senha deve ter no máximo 72 caracteres')
    .regex(PASSWORD_POLICY, 'A senha deve conter ao menos uma letra e um número'),
  company: z
    .string()
    .max(255, 'Empresa deve ter no máximo 255 caracteres')
    // Uma empresa vazia ("") é tratada como não informada (aceita); já uma
    // empresa preenchida só com espaços em branco é inválida — igual ao nome.
    // Ver specs/nutritionist-auth/spec.md - "Nome ou empresa apenas com espaços em branco".
    .refine((value) => value.length === 0 || value.trim().length > 0, {
      message: 'Empresa não pode conter apenas espaços em branco',
    })
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

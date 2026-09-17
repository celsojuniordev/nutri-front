import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/features/auth/api'
import GoogleLoginButton from '@/features/auth/GoogleLoginButton'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { useAuth } from '@/features/auth/useAuth'
import { getApiError } from '@/lib/apiError'

const GENERIC_LOGIN_ERROR = 'Não foi possível entrar. Tente novamente em instantes.'
const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha incorretos.'

function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      auth.login(data.token)
      navigate('/perfil')
    },
    onError: (error) => {
      const apiError = getApiError(error)

      if (apiError?.error === 'INVALID_CREDENTIALS') {
        setFormError(INVALID_CREDENTIALS_MESSAGE)
        return
      }

      setFormError(GENERIC_LOGIN_ERROR)
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null)
    mutation.mutate(values)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto flex w-full max-w-sm flex-col gap-4 p-8"
    >
      <h1 className="font-heading text-2xl font-bold text-neutral-900">Entrar</h1>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível entrar</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input id="login-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={!isValid || isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Entrando…' : 'Entrar'}
      </Button>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <div className="h-px flex-grow bg-neutral-100" />
        ou
        <div className="h-px flex-grow bg-neutral-100" />
      </div>

      <GoogleLoginButton />

      <p className="text-center text-sm text-neutral-600">
        Não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </form>
  )
}

export default LoginPage

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register as registerNutritionist } from '@/features/auth/api'
import GoogleLoginButton from '@/features/auth/GoogleLoginButton'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { getApiError } from '@/lib/apiError'

function RegisterPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '', company: '' },
  })

  const mutation = useMutation({
    mutationFn: registerNutritionist,
    onSuccess: () => {
      navigate('/login', { state: { registered: true } })
    },
    onError: (error) => {
      const apiError = getApiError(error)

      if (apiError?.error === 'EMAIL_ALREADY_IN_USE') {
        setError('email', { message: 'Este e-mail já está em uso. Tente entrar.' })
        return
      }

      if (apiError?.error === 'VALIDATION_ERROR' && apiError.details) {
        for (const detail of apiError.details) {
          setError(detail.field as keyof RegisterFormValues, { message: detail.message })
        }
        return
      }

      setFormError('Não foi possível concluir o cadastro. Tente novamente em instantes.')
    },
  })

  const onSubmit = (values: RegisterFormValues) => {
    setFormError(null)
    mutation.mutate(values)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto flex w-full max-w-sm flex-col gap-4 p-8"
    >
      <h1 className="font-heading text-2xl font-bold text-neutral-900">Criar conta</h1>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível criar sua conta</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="register-name">Nome completo</Label>
        <Input id="register-name" type="text" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-sm text-danger">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-email">E-mail</Label>
        <Input id="register-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          type="password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
        <p className="text-xs text-neutral-600">Mínimo de 8 caracteres, com letra e número.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-company">
          Empresa <span className="text-neutral-400">(opcional)</span>
        </Label>
        <Input id="register-company" type="text" aria-invalid={!!errors.company} {...register('company')} />
        {errors.company && <p className="text-sm text-danger">{errors.company.message}</p>}
      </div>

      <Button type="submit" disabled={!isValid || isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <div className="h-px flex-grow bg-neutral-100" />
        ou
        <div className="h-px flex-grow bg-neutral-100" />
      </div>

      <GoogleLoginButton />

      <p className="text-center text-sm text-neutral-600">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </form>
  )
}

export default RegisterPage

import { http } from '@/lib/http'
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
  LoginRequest,
  LoginResponse,
  NutritionistResponse,
  RegisterRequest,
} from '@/features/auth/types'

export async function register(request: RegisterRequest): Promise<NutritionistResponse> {
  const { data } = await http.post<NutritionistResponse>('/api/nutricionistas', request)
  return data
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/api/auth/login', request)
  return data
}

export async function loginWithGoogle(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
  const { data } = await http.post<GoogleLoginResponse>('/api/auth/google', request)
  return data
}

export async function logout(): Promise<void> {
  await http.post('/api/auth/logout')
}

export async function getMe(): Promise<NutritionistResponse> {
  const { data } = await http.get<NutritionistResponse>('/api/nutricionistas/me')
  return data
}

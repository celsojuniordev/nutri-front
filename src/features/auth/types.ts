export interface RegisterRequest {
  name: string
  email: string
  password: string
  company?: string
}

export interface NutritionistResponse {
  id: number
  name: string
  company?: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface GoogleLoginResponse {
  token: string
  accountCreated: boolean
}

export interface ApiErrorFieldDetail {
  field: string
  message: string
}

export interface ApiError {
  status: number
  error:
    | 'VALIDATION_ERROR'
    | 'EMAIL_ALREADY_IN_USE'
    | 'INVALID_CREDENTIALS'
    | 'UNAUTHORIZED'
    | 'GOOGLE_TOKEN_INVALID'
  message: string
  details?: ApiErrorFieldDetail[]
  timestamp: string
}

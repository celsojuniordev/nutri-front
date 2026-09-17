import { isAxiosError } from 'axios'
import type { ApiError } from '@/features/auth/types'

export function getApiError(error: unknown): ApiError | undefined {
  if (isAxiosError(error) && error.response?.data) {
    return error.response.data as ApiError
  }
  return undefined
}

import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Valores padrão para os testes: qualquer módulo importado transitivamente
// (ex.: App -> páginas -> api -> http -> env) encontra variáveis de ambiente
// válidas por padrão. Testes que precisam validar o comportamento de
// variável ausente (ver env.test.ts) sobrescrevem isso com vi.stubEnv.
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-google-client-id')

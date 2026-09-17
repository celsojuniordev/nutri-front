function readRequiredEnvVar(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. Defina-a em um arquivo .env (ver .env.example) antes de rodar a aplicação.`,
    )
  }
  return value
}

export const env = {
  apiBaseUrl: readRequiredEnvVar('VITE_API_BASE_URL'),
  googleClientId: readRequiredEnvVar('VITE_GOOGLE_CLIENT_ID'),
}

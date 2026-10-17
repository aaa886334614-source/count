export interface HealthConfig {
  ok: boolean
  appEnv: string
  turnstileRequired: boolean
  emailVerificationRequired: boolean
}

let cached: HealthConfig | null = null

export async function fetchHealthConfig(): Promise<HealthConfig | null> {
  if (cached) return cached
  try {
    const res = await fetch('/api/health', { credentials: 'include' })
    if (!res.ok) return null
    const data = (await res.json()) as HealthConfig
    cached = data
    return data
  } catch {
    return null
  }
}

export function clearHealthConfigCache() {
  cached = null
}

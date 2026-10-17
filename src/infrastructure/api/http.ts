export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function turnstileHeaders(token?: string): HeadersInit | undefined {
  if (!token) return undefined
  return { 'x-turnstile-token': token }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { turnstileToken?: string },
): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (init?.turnstileToken) {
    headers.set('x-turnstile-token', init.turnstileToken)
  }

  const res = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { error?: string; message?: string }
      message = body.error ?? body.message ?? message
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

let backendConfigured: boolean | null = null

/** 是否可連線 Workers API（非 Supabase 設定） */
export async function isBackendConfigured(): Promise<boolean> {
  if (backendConfigured !== null) return backendConfigured
  try {
    const res = await fetch('/api/health', { credentials: 'include' })
    backendConfigured = res.ok
  } catch {
    backendConfigured = false
  }
  return backendConfigured
}

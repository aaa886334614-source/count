import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authClient, type AuthUser } from '@/infrastructure/api/authClient'
import { apiFetch, isBackendConfigured } from '@/infrastructure/api/http'

export interface AuthErrorLike {
  message: string
}

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  configured: boolean
  signIn: (
    email: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<{ error: AuthErrorLike | null }>
  signUp: (
    email: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<{ error: AuthErrorLike | null }>
  signOut: () => Promise<{ error: AuthErrorLike | null }>
  resetPassword: (
    email: string,
    turnstileToken?: string,
  ) => Promise<{ error: AuthErrorLike | null }>
  updatePassword: (password: string) => Promise<{ error: AuthErrorLike | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapError(err: unknown): AuthErrorLike {
  if (err && typeof err === 'object' && 'message' in err) {
    return { message: String((err as { message: unknown }).message) }
  }
  return { message: '操作失敗' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending } = authClient.useSession()
  const [configured, setConfigured] = useState(false)
  const [configChecked, setConfigChecked] = useState(false)

  useEffect(() => {
    void isBackendConfigured().then((ok) => {
      setConfigured(ok)
      setConfigChecked(true)
    })
  }, [])

  const user = useMemo((): AuthUser | null => {
    const u = sessionData?.user
    if (!u) return null
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      emailVerified: u.emailVerified,
      image: u.image,
    }
  }, [sessionData?.user])

  const loading = !configChecked || isPending

  const signIn = useCallback(
    async (email: string, password: string, turnstileToken?: string) => {
      if (!configured) {
        return { error: { message: '後端 API 尚未就緒（請使用 wrangler / Cloudflare dev）' } }
      }
      const { error } = await authClient.signIn.email({
        email,
        password,
        fetchOptions: turnstileToken
          ? { headers: { 'x-turnstile-token': turnstileToken } }
          : undefined,
      })
      return { error: error ? mapError(error) : null }
    },
    [configured],
  )

  const signUp = useCallback(
    async (email: string, password: string, turnstileToken?: string) => {
      if (!configured) {
        return { error: { message: '後端 API 尚未就緒' } }
      }
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: email.split('@')[0] ?? '會員',
        fetchOptions: turnstileToken
          ? { headers: { 'x-turnstile-token': turnstileToken } }
          : undefined,
      })
      return { error: error ? mapError(error) : null }
    },
    [configured],
  )

  const signOut = useCallback(async () => {
    const { error } = await authClient.signOut()
    return { error: error ? mapError(error) : null }
  }, [])

  const resetPassword = useCallback(
    async (email: string, turnstileToken?: string) => {
      if (!configured) {
        return { error: { message: '後端 API 尚未就緒' } }
      }
      try {
        await apiFetch('/api/auth/request-password-reset', {
          method: 'POST',
          body: JSON.stringify({
            email,
            redirectTo: `${window.location.origin}/account?recovery=1`,
          }),
          turnstileToken,
        })
        return { error: null }
      } catch (e) {
        return { error: mapError(e) }
      }
    },
    [configured],
  )

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await authClient.resetPassword({ newPassword: password })
    return { error: error ? mapError(error) : null }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [
      user,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext 必須在 AuthProvider 內使用')
  }
  return ctx
}

export function useAuth() {
  const ctx = useAuthContext()
  return {
    user: ctx.user,
    ready: !ctx.loading,
    loading: ctx.loading,
    configured: ctx.configured,
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
    resetPassword: ctx.resetPassword,
    updatePassword: ctx.updatePassword,
  }
}

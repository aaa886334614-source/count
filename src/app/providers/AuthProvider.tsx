import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthError, Session, User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/infrastructure/supabase/client'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }
    const sb = getSupabase()
    void sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [configured])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!configured) {
        return { error: { message: 'Supabase 尚未設定' } as AuthError }
      }
      const { error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    },
    [configured],
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!configured) {
        return { error: { message: 'Supabase 尚未設定' } as AuthError }
      }
      const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
        },
      })
      return { error }
    },
    [configured],
  )

  const signOut = useCallback(async () => {
    if (!configured) return { error: null }
    const { error } = await getSupabase().auth.signOut()
    return { error }
  }, [configured])

  const resetPassword = useCallback(
    async (email: string) => {
      if (!configured) {
        return { error: { message: 'Supabase 尚未設定' } as AuthError }
      }
      const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account?recovery=1`,
      })
      return { error }
    },
    [configured],
  )

  const updatePassword = useCallback(
    async (password: string) => {
      if (!configured) {
        return { error: { message: 'Supabase 尚未設定' } as AuthError }
      }
      const { error } = await getSupabase().auth.updateUser({ password })
      return { error }
    },
    [configured],
  )

  const value = useMemo(
    () => ({
      user,
      session,
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
      session,
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

/** 與舊 hook 相容 */
export function useAuth() {
  const ctx = useAuthContext()
  return {
    user: ctx.user,
    session: ctx.session,
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

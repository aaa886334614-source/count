import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/infrastructure/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setReady(true)
      return
    }
    const sb = getSupabase()
    void sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setReady(true)
    })
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setUser(s?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [configured])

  return { user, session, ready, configured }
}

import { createAuthClient } from 'better-auth/react'

const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL as string | undefined) ?? 'http://localhost:5173'

export const authClient = createAuthClient({
  baseURL,
})

export type AuthUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image?: string | null
}

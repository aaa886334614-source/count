import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb, schema } from '../db/client'
import type { Env } from '../env'
import { sendAuthEmail } from './email'
import { resetPasswordEmailHtml, verificationEmailHtml } from './emailTemplates'

function isPublicEnv(env: Env): boolean {
  return env.APP_ENV === 'staging' || env.APP_ENV === 'production'
}

export function createAuth(env: Env) {
  const db = createDb(env.DB)
  const trusted = env.TRUSTED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [
    env.BETTER_AUTH_URL,
  ]
  const requireVerify =
    env.REQUIRE_EMAIL_VERIFICATION === '1' || isPublicEnv(env)

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: trusted,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: requireVerify,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail(env, {
          to: user.email,
          subject: '奇門遁甲 — 重設密碼',
          html: resetPasswordEmailHtml(url),
        })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail(env, {
          to: user.email,
          subject: '奇門遁甲 — 請驗證您的 Email',
          html: verificationEmailHtml(url),
        })
      },
    },
    advanced: {
      cookiePrefix: 'qimen',
    },
  })
}

export type AuthInstance = ReturnType<typeof createAuth>

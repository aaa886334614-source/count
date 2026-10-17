import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb, schema } from '../db/client'
import type { Env } from '../env'
import { sendAuthEmail } from './email'

export function createAuth(env: Env) {
  const db = createDb(env.DB)
  const trusted = env.TRUSTED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [
    env.BETTER_AUTH_URL,
  ]
  const requireVerify = env.REQUIRE_EMAIL_VERIFICATION === '1'

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
          html: `<p>請在 1 小時內開啟連結重設密碼：</p><p><a href="${url}">${url}</a></p>`,
        })
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail(env, {
          to: user.email,
          subject: '奇門遁甲 — 驗證 Email',
          html: `<p>請完成 Email 驗證：</p><p><a href="${url}">${url}</a></p>`,
        })
      },
    },
    advanced: {
      cookiePrefix: 'qimen',
    },
  })
}

export type AuthInstance = ReturnType<typeof createAuth>

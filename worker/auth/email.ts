import type { Env } from '../env'

export async function sendAuthEmail(
  env: Env,
  message: { to: string; subject: string; html: string },
): Promise<void> {
  const key = env.RESEND_API_KEY
  if (!key) {
    console.warn(
      '[auth] RESEND_API_KEY 未設定，無法寄送郵件：',
      message.subject,
      message.to,
    )
    throw new Error('EMAIL_PROVIDER_NOT_CONFIGURED')
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM ?? 'onboarding@resend.dev',
      to: message.to,
      subject: message.subject,
      html: message.html,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`EMAIL_SEND_FAILED: ${text}`)
  }
}

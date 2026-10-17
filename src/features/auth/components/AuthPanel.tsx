import { useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/infrastructure/supabase/client'

export function AuthPanel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!isSupabaseConfigured()) {
    return (
      <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
        <h2 className="text-lg font-semibold">會員登入</h2>
        <p className="mt-2 text-[15px] text-[var(--color-muted)]">
          Supabase 尚未連線。請建立專案並設定環境變數（見 docs/ENV.example.md）。
          程式已含 Auth／RLS migration，連線後即可使用雲端存盤。
        </p>
      </section>
    )
  }

  const sb = getSupabase()

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setMessage(null)
    try {
      await fn()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '操作失敗')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
      <h2 className="text-lg font-semibold">會員</h2>
      <label className="mt-3 block text-sm">
        電子郵件
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="mt-3 block text-sm">
        密碼
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {message && (
        <p className="mt-2 text-[15px] text-[var(--color-wine)]">{message}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          className="rounded-lg bg-[var(--color-wine)] px-4 py-2 text-white"
          onClick={() =>
            void run(async () => {
              const { error } = await sb.auth.signInWithPassword({ email, password })
              if (error) throw error
              setMessage('登入成功')
            })
          }
        >
          登入
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg border px-4 py-2"
          onClick={() =>
            void run(async () => {
              const { error } = await sb.auth.signUp({ email, password })
              if (error) throw error
              setMessage('註冊已送出，請至信箱完成驗證（若已啟用）')
            })
          }
        >
          註冊
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg border px-4 py-2"
          onClick={() =>
            void run(async () => {
              const { error } = await sb.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/account`,
              })
              if (error) throw error
              setMessage('重設密碼信已寄出')
            })
          }
        >
          忘記密碼
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg border px-4 py-2"
          onClick={() =>
            void run(async () => {
              const { error } = await sb.auth.signOut()
              if (error) throw error
              setMessage('已登出')
            })
          }
        >
          登出
        </button>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  clearPendingSave,
  readPendingSave,
} from '@/features/chart-history/services/pendingSaveStorage'
import { fetchHealthConfig, type HealthConfig } from '@/infrastructure/api/health'
import {
  isTurnstileConfigured,
  TurnstileWidget,
} from '@/features/auth/components/TurnstileWidget'

export function AuthPanel() {
  const {
    user,
    configured,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
  } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  )
  const [busy, setBusy] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileReset, setTurnstileReset] = useState(0)
  const [health, setHealth] = useState<HealthConfig | null>(null)
  const recovery = new URLSearchParams(location.search).has('recovery')

  const turnstileRequired =
    Boolean(health?.turnstileRequired) && isTurnstileConfigured()

  useEffect(() => {
    if (configured) void fetchHealthConfig().then(setHealth)
  }, [configured])

  useEffect(() => {
    if (!loading && user) {
      const pending = readPendingSave()
      if (pending?.returnPath) {
        navigate(pending.returnPath, { replace: true })
      }
    }
  }, [loading, user, navigate])

  function bumpTurnstile() {
    setTurnstileToken(null)
    setTurnstileReset((n) => n + 1)
  }

  function ensureTurnstile(): boolean {
    if (!turnstileRequired) return true
    if (turnstileToken) return true
    setMessage('請先完成人機驗證（Turnstile）')
    return false
  }

  if (!configured) {
    return (
      <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
        <h2 className="text-lg font-semibold">會員登入</h2>
        <p className="mt-2 text-[15px] text-[var(--color-muted)]">
          Cloudflare Workers API 尚未連線。請使用{' '}
          <code>npm run dev</code>（含 @cloudflare/vite-plugin）並套用 D1
          migration，詳見 docs/CLOUDFLARE_SETUP.md。
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          未連線時仍可離線排盤；雲端存盤程式已就緒，但不會假裝已驗證連線。
        </p>
      </section>
    )
  }

  if (loading) {
    return <p>正在確認登入狀態…</p>
  }

  if (user) {
    return (
      <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
        <h2 className="text-lg font-semibold">已登入</h2>
        <p className="mt-2 text-sm">{user.email}</p>
        {!user.emailVerified && (
          <>
            <p className="mt-2 text-sm text-[var(--color-wine)]">
              信箱尚未驗證，完成驗證後才能使用雲端存盤（Staging/正式環境強制）。
            </p>
            <button
              type="button"
              className="mt-2 rounded-lg border px-3 py-1 text-sm"
              disabled={busy}
              onClick={() =>
                void (async () => {
                  if (!ensureTurnstile()) return
                  setBusy(true)
                  const { error } = await resendVerificationEmail(
                    user.email,
                    turnstileToken ?? undefined,
                  )
                  if (error) setMessage(error.message)
                  else
                    setMessage(
                      '若已設定 Resend，驗證信已寄出；未設定則後端會回傳錯誤。',
                    )
                  bumpTurnstile()
                  setBusy(false)
                })()
              }
            >
              重新寄送驗證信
            </button>
          </>
        )}
        <button
          type="button"
          className="mt-4 rounded-lg border px-4 py-2"
          disabled={busy}
          onClick={() =>
            void (async () => {
              setBusy(true)
              const { error } = await signOut()
              if (error) setMessage(error.message)
              else {
                clearPendingSave()
                setMessage('已登出')
              }
              setBusy(false)
            })()
          }
        >
          登出
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
      <h2 className="text-lg font-semibold">會員</h2>
      {health?.turnstileRequired && !isTurnstileConfigured() && (
        <p className="mt-2 text-sm text-[var(--color-wine)]">
          此環境要求 Turnstile，但前端未設定 VITE_TURNSTILE_SITE_KEY。
        </p>
      )}
      {recovery && (
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          請設定新密碼（重設密碼流程）。
        </p>
      )}
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
      {!recovery ? (
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
      ) : (
        <label className="mt-3 block text-sm">
          新密碼
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
      )}
      {!recovery && (
        <TurnstileWidget
          resetSignal={turnstileReset}
          onToken={setTurnstileToken}
        />
      )}
      {message && (
        <p className="mt-2 text-[15px] text-[var(--color-wine)]">{message}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {!recovery ? (
          <>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg bg-[var(--color-wine)] px-4 py-2 text-white"
              onClick={() =>
                void (async () => {
                  if (!ensureTurnstile()) return
                  setBusy(true)
                  setMessage(null)
                  const { error } = await signIn(
                    email,
                    password,
                    turnstileToken ?? undefined,
                  )
                  if (error) {
                    setMessage(error.message)
                    bumpTurnstile()
                  }
                  setBusy(false)
                })()
              }
            >
              登入
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border px-4 py-2"
              onClick={() =>
                void (async () => {
                  if (!ensureTurnstile()) return
                  setBusy(true)
                  setMessage(null)
                  const { error } = await signUp(
                    email,
                    password,
                    turnstileToken ?? undefined,
                  )
                  if (error) {
                    setMessage(error.message)
                    bumpTurnstile()
                  } else {
                    setMessage(
                      health?.emailVerificationRequired
                        ? '註冊成功。若已設定 Resend，驗證信已寄出，請至信箱完成驗證後再登入。'
                        : '註冊成功，請登入。',
                    )
                  }
                  setBusy(false)
                })()
              }
            >
              註冊
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border px-4 py-2"
              onClick={() =>
                void (async () => {
                  if (!ensureTurnstile()) return
                  setBusy(true)
                  setMessage(null)
                  const { error } = await resetPassword(
                    email,
                    turnstileToken ?? undefined,
                  )
                  if (error) {
                    setMessage(error.message)
                    bumpTurnstile()
                  } else {
                    setMessage(
                      '若已設定 Resend，重設密碼信已寄出；未設定時後端會回傳錯誤。',
                    )
                  }
                  setBusy(false)
                })()
              }
            >
              忘記密碼
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            className="rounded-lg bg-[var(--color-wine)] px-4 py-2 text-white"
            onClick={() =>
              void (async () => {
                setBusy(true)
                const { error } = await updatePassword(newPassword)
                if (error) setMessage(error.message)
                else {
                  setMessage('密碼已更新')
                  navigate('/account', { replace: true })
                }
                setBusy(false)
              })()
            }
          >
            更新密碼
          </button>
        )}
      </div>
    </section>
  )
}

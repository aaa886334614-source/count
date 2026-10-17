import { useEffect, useId, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const SCRIPT_ID = 'cf-turnstile-script'

export function turnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  return key?.trim() || undefined
}

export function isTurnstileConfigured(): boolean {
  return Boolean(turnstileSiteKey())
}

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  const existing = document.getElementById(SCRIPT_ID)
  if (existing) {
    return new Promise((resolve) => {
      window.onTurnstileLoad = () => resolve()
    })
  }
  return new Promise((resolve, reject) => {
    window.onTurnstileLoad = () => resolve()
    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
    s.async = true
    s.defer = true
    s.onerror = () => reject(new Error('Turnstile 腳本載入失敗'))
    document.head.appendChild(s)
  })
}

export function TurnstileWidget(props: {
  onToken: (token: string | null) => void
  resetSignal?: number
}) {
  const containerId = useId().replace(/:/g, '')
  const widgetIdRef = useRef<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const siteKey = turnstileSiteKey()

  const onTokenRef = useRef(props.onToken)
  onTokenRef.current = props.onToken

  useEffect(() => {
    if (!siteKey) {
      onTokenRef.current(null)
      return
    }
    let cancelled = false
    void loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile) return
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
        widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => {
            onTokenRef.current(null)
            setErr('驗證元件錯誤，請重新整理')
          },
        })
      })
      .catch(() => setErr('無法載入 Turnstile'))
    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [containerId, siteKey, props.resetSignal])

  if (!siteKey) return null

  return (
    <div className="mt-3">
      <div id={containerId} />
      {err && <p className="mt-1 text-sm text-[var(--color-wine)]">{err}</p>}
    </div>
  )
}

export function resetTurnstileWidget(widgetId?: string) {
  window.turnstile?.reset(widgetId)
}

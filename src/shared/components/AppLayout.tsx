import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-[var(--color-wine)] text-white' : 'bg-white ring-1 ring-[var(--color-line)]'}`

export function AppLayout() {
  const { user, configured } = useAuth()

  return (
    <div className="min-h-screen bg-[#fafafa] text-[var(--color-ink)]">
      <nav className="sticky top-0 z-10 border-b border-[var(--color-line)] bg-[#fafafa]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[960px] flex-wrap items-center gap-2 px-4 py-3">
          <NavLink to="/" className="mr-2 font-bold">
            奇門工作台
          </NavLink>
          <NavLink to="/time-chart" className={linkClass}>
            時刻排盤
          </NavLink>
          <NavLink to="/single-palace" className={linkClass}>
            六位數單宮
          </NavLink>
          <NavLink to="/harms" className={linkClass}>
            四害查詢
          </NavLink>
          <NavLink to="/charts" className={linkClass}>
            我的排盤
          </NavLink>
          <NavLink to="/account" className={linkClass}>
            會員
          </NavLink>
          {configured && user && (
            <span className="ml-auto text-xs text-[var(--color-muted)]">
              {user.email}
            </span>
          )}
        </div>
      </nav>
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-5 px-[18px] pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

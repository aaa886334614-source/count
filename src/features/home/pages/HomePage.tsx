import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="card-fade space-y-4">
      <h1 className="text-[32px] font-extrabold">奇門遁甲整合工作台</h1>
      <p className="text-[16px] leading-relaxed text-[var(--color-muted)]">
        時刻陰盤 v0.4 與六位數單宮斷已整合：九宮點選可連動單宮四害與環境化解決策。
        會員雲端存盤需設定 Supabase（見 docs/ENV.example.md）。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/time-chart"
          className="btn-press rounded-[16px] bg-[var(--color-wine)] px-6 py-3 text-center font-semibold text-white"
        >
          時刻排盤
        </Link>
        <Link
          to="/single-palace"
          className="btn-press rounded-[16px] bg-white px-6 py-3 text-center font-medium ring-1 ring-[var(--color-line)]"
        >
          六位數單宮斷
        </Link>
      </div>
    </section>
  )
}

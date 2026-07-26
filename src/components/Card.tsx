import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: ReactNode
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
}: CardProps) {
  return (
    <section
      className={`card-fade rounded-[20px] bg-white px-5 py-5 shadow-[var(--shadow-card)] sm:px-6 sm:py-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-[32px]">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-muted)] sm:text-[15px]">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

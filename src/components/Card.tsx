import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <section
      className={`card-fade rounded-[20px] bg-white p-6 shadow-[var(--shadow-card)] ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          {title ? (
            <h2 className="text-[24px] font-bold leading-tight text-[var(--color-ink)] sm:text-[28px]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

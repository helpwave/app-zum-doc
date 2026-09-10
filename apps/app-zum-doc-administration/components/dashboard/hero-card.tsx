import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

export function DashboardHeroCard({ children }: PropsWithChildren) {
  return (
    <div className="flex-col-3 justify-between w-full min-h-36 p-5 rounded-2xl bg-surface shadow-around-md">
      {children}
    </div>
  )
}

export function DashboardHeroMetric({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span className={clsx('text-4xl font-semibold leading-none', className)}>
      {children}
    </span>
  )
}

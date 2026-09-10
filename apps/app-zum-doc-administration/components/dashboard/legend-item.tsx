import type { ReactNode } from 'react'
import clsx from 'clsx'

export function DashboardLegendItem({
  colorClassName,
  label,
  value,
}: {
  colorClassName: string,
  label: string,
  value: ReactNode,
}) {
  return (
    <li className="flex-row-2 items-center min-w-0 text-sm">
      <span className={clsx('size-2.5 rounded-full shrink-0', colorClassName)} />
      <span className="truncate">{label}</span>
      <span className="ml-auto shrink-0 text-description">{value}</span>
    </li>
  )
}

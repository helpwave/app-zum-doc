import Link from 'next/link'
import { Chip } from '@helpwave/hightide'
import { ChevronRight } from 'lucide-react'

export function DashboardListRow({
  href,
  time,
  name,
  insuranceLabel,
  detail,
  actionLabel,
}: {
  href: string,
  time: string,
  name: string,
  insuranceLabel: string,
  detail: string,
  actionLabel: string,
}) {
  return (
    <Link href={href} className="dashboard-list-row">
      <div className="dashboard-list-body">
        <span className="dashboard-list-time">{time}</span>
        <div className="dashboard-list-main">
          <span className="dashboard-list-name">{name}</span>
          <Chip size="xs" color="neutral" coloringStyle="tonal" className="truncate">
            {insuranceLabel}
          </Chip>
          <span className="dashboard-list-detail">{detail}</span>
        </div>
      </div>
      <span className="dashboard-row-action" aria-label={actionLabel}>
        <ChevronRight className="size-4" />
      </span>
    </Link>
  )
}

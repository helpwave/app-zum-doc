import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export function NavigationListTile({
  href,
  title,
  description,
  leading,
  onClick,
}: {
  href: string,
  title: string,
  description?: string,
  leading?: ReactNode,
  onClick?: () => void,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex-row-3 items-center w-full min-w-0 px-3 py-2 rounded-xl bg-surface-secondary"
    >
      {leading}
      <span className="flex-col-0 min-w-0 flex-1">
        <span className="typography-label-md truncate">{title}</span>
        {description && (
          <span className="text-description truncate">{description}</span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0" />
    </Link>
  )
}

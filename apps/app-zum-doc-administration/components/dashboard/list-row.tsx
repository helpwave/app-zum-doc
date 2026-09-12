import Link from 'next/link'
import clsx from 'clsx'
import { Chip } from '@helpwave/hightide'
import { ChevronRight } from 'lucide-react'

export const listRowClassName = (
  '@container flex-row-3 items-center w-full min-w-0 px-4 py-3 rounded-xl bg-surface shadow-around-md'
)
export const listRowMainClassName = 'flex flex-col gap-y-0.5 min-w-0 flex-1'

const listRowBodyClassName = (
  'flex-row-3 items-center min-w-0 flex-1 @max-[20rem]:flex-col-1 @max-[20rem]:items-stretch @max-[20rem]:truncate'
)
const listRowTimeClassName = (
  'shrink-0 text-description text-sm max-w-16 min-w-16 @max-[20rem]:w-full @max-[20rem]:typography-title-sm @max-[20rem]:text-primary @max-[20rem]:truncate'
)
const listRowNameClassName = 'typography-title-sm truncate'
const listRowDetailClassName = (
  'min-w-0 shrink-0 text-description text-sm truncate @max-[20rem]:max-w-none @max-[20rem]:truncate'
)
const listRowActionClassName = (
  'flex items-center justify-center size-8 rounded-lg bg-primary text-on-primary shrink-0'
)

export function DashboardListRow({
  href,
  onClick,
  time,
  name,
  insuranceLabel,
  detail,
  actionLabel,
}: {
  href?: string,
  onClick?: () => void,
  time: string,
  name: string,
  insuranceLabel: string,
  detail: string,
  actionLabel: string,
}) {
  const content = (
    <>
      <div className={listRowBodyClassName}>
        <span className={listRowTimeClassName}>{time}</span>
        <div className={listRowMainClassName}>
          <span className={listRowNameClassName}>{name}</span>
          <Chip size="xs" color="neutral" coloringStyle="tonal" className="truncate">
            {insuranceLabel}
          </Chip>
          <span className={listRowDetailClassName}>{detail}</span>
        </div>
      </div>
      <span className={listRowActionClassName} aria-label={actionLabel}>
        <ChevronRight className="size-4" />
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={listRowClassName}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={clsx(listRowClassName, 'text-left')}
      onClick={onClick}
    >
      {content}
    </button>
  )
}

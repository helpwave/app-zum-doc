import { ActionCard, Chip, NavigationCard } from '@helpwave/hightide'

export function DashboardListRow({
  href,
  onClick,
  time,
  name,
  insuranceLabel,
  detail,
}: {
  href?: string,
  onClick?: () => void,
  time: string,
  name: string,
  insuranceLabel: string,
  detail: string,
  actionLabel: string,
}) {
  const title = (
    <div className="flex-col-1">
      <span className="typography-title-sm text-primary truncate block">{time}</span>
      <span className="typography-title-md truncate block">{name}</span>
      <Chip size="xs" color="neutral" coloringStyle="tonal" className="truncate block">
        {insuranceLabel}
      </Chip>
    </div>
  )
  const description = (
    <span className="text-sm truncate block">
      {detail}
    </span>
  )

  if (href) {
    return (
      <NavigationCard
        href={href}
        title={title}
        description={description}
      />
    )
  }

  return (
    <ActionCard
      onClick={onClick}
      title={title}
      description={description}
    />
  )
}

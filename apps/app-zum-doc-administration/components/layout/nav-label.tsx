import { Chip } from '@helpwave/hightide'

export function NavLabel({
  label,
  count,
  hasDividerBefore,
}: {
  label: string,
  count?: number,
  hasDividerBefore?: boolean,
}) {
  return (
    <span
      className="flex-row-2 items-center justify-between w-full min-w-0"
      {...(hasDividerBefore ? { 'data-nav-divider-before': '' } : {})}
    >
      <span className="truncate">{label}</span>
      {count != null && count > 0 && (
        <Chip size="xs" color="neutral" coloringStyle="tonal">
          {count}
        </Chip>
      )}
    </span>
  )
}

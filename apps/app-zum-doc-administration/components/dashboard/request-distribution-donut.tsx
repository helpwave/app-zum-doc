import type { PracticeRequestDistribution } from '@app-zum-doc/utils/api'

type Slice = {
  value: number,
  color: string,
}

function coordinates(percent: number, radius: number): [number, number] {
  const angle = 2 * Math.PI * percent - Math.PI / 2
  return [radius * Math.cos(angle), radius * Math.sin(angle)]
}

function donutPath(start: number, fraction: number, radius: number, thickness: number): string {
  if (fraction <= 0) {
    return ''
  }
  const end = Math.min(start + fraction, 0.9999)
  const inner = radius - thickness
  const [startX, startY] = coordinates(start, radius)
  const [endX, endY] = coordinates(end, radius)
  const [innerStartX, innerStartY] = coordinates(start, inner)
  const [innerEndX, innerEndY] = coordinates(end, inner)
  const largeArc = fraction > 0.5 ? 1 : 0
  return [
    `M ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${inner} ${inner} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}`,
    'Z',
  ].join(' ')
}

export function RequestDistributionDonut({
  distribution,
}: {
  distribution: PracticeRequestDistribution,
}) {
  const slices: Slice[] = [
    { value: distribution.sickNotes, color: 'var(--color-primary)' },
    { value: distribution.referrals, color: 'var(--color-secondary)' },
    { value: distribution.appointments, color: 'var(--color-warning)' },
  ]
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const radius = 42
  const thickness = 14
  let offset = 0

  return (
    <svg
      viewBox="-48 -48 96 96"
      className="size-24 shrink-0"
      aria-hidden="true"
    >
      {total === 0 ? (
        <circle
          r={radius - thickness / 2}
          fill="none"
          stroke="var(--color-disabled)"
          strokeWidth={thickness}
        />
      ) : (
        slices.map((slice) => {
          if (slice.value <= 0) {
            return null
          }
          const fraction = slice.value / total
          const path = donutPath(offset, fraction, radius, thickness)
          offset += fraction
          return (
            <path key={slice.color} d={path} fill={slice.color} />
          )
        })
      )}
    </svg>
  )
}

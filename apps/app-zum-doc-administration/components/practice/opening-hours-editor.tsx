import { Chip, IconButton, Input } from '@helpwave/hightide'
import { Plus, Trash2 } from 'lucide-react'
import {
  WeekdayUtils,
  type Weekday
} from '@app-zum-doc/utils/api'
import {
  emptyOpeningHoursRange,
  isOpeningHoursRangeInvalid,
  type OpeningHoursRange
} from '@/lib/opening-hours-form'
import { weekdayLabel } from '@/lib/labels'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: Record<Weekday, OpeningHoursRange[]>,
  onChange: (next: Record<Weekday, OpeningHoursRange[]>) => void,
}) {
  const t = useAdministrationTranslation()

  const updateDay = (day: Weekday, ranges: OpeningHoursRange[]) => {
    onChange({
      ...value,
      [day]: ranges,
    })
  }

  return (
    <div className="flex-col-6 w-full">
      {WeekdayUtils.array.map((day) => {
        const ranges = value[day] ?? []
        const dayName = weekdayLabel(day, t)

        return (
          <div key={day} className="flex-col-1 w-full">
            <div className="flex-row-2 items-center">
              <span className="typography-label-md min-w-0">{dayName}</span>
              <IconButton
                type="button"
                size="xs"
                color="primary"
                coloringStyle="tonal"
                tooltip={t('addTimeRange')}
                onClick={() => {
                  updateDay(day, [...ranges, emptyOpeningHoursRange()])
                }}
              >
                <Plus className="size-4" />
              </IconButton>
            </div>
            {ranges.length === 0 ? (
              <Chip color="neutral" size="sm">
                <p className="text-description">{t('emptyPracticeHours')}</p>
              </Chip>
            ) : (
              <div className="flex-col-2 w-full">
                {ranges.map((range, index) => {
                  const invalid = isOpeningHoursRangeInvalid(range)
                  return (
                    <div key={`${day}-${index}`} className="flex-row-3 items-center w-full min-w-0">
                      <Input
                        type="time"
                        value={range.start}
                        invalid={invalid}
                        onValueChange={(start) => {
                          updateDay(day, ranges.map((item, itemIndex) => (
                            itemIndex === index
                              ? { ...item, start }
                              : item
                          )))
                        }}
                      />
                      <span className="text-description">-</span>
                      <Input
                        type="time"
                        value={range.end}
                        invalid={invalid}
                        onValueChange={(end) => {
                          updateDay(day, ranges.map((item, itemIndex) => (
                            itemIndex === index
                              ? { ...item, end }
                              : item
                          )))
                        }}
                      />
                      <IconButton
                        type="button"
                        size="sm"
                        coloringStyle="text"
                        tooltip={t('deleteTimeRange')}
                        onClick={() => {
                          updateDay(day, ranges.filter((_, itemIndex) => itemIndex !== index))
                        }}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

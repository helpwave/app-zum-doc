import { Button, IconButton, Select } from '@helpwave/hightide'
import { Plus, Trash2 } from 'lucide-react'
import type { SearchSpecialization } from '@app-zum-doc/utils/api'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'
import { useMemo } from 'react'

export function SpecializationEditor({
  value,
  options,
  onChange,
}: {
  value: string[],
  options: SearchSpecialization[],
  onChange: (next: string[]) => void,
}) {
  const t = useAdministrationTranslation()
  const selected = new Set(value)
  const unused = options.filter((option) => !selected.has(option.id))
  const canAdd = unused.length > 0

  const values = useMemo(() => value.length < 1 ? [null] : value, [value])

  return (
    <div className="flex-col-3 w-full">
      {values.map((specializationId, index) => (
        <div key={index} className="flex-row-3 items-center w-full min-w-0">
          <div className="min-w-0 flex-1">
            <Select
              value={specializationId ? specializationId : null}
              placeholder={t('specialization')}
              showSearch
              onValueChange={(next) => {
                console.log(next)
                if (next == null) {
                  return
                }
                onChange(values.map((item, itemIndex) => (
                  itemIndex === index ? next : item
                )).filter(Boolean) as string[])
              }}
            >
              {options.map((option) => (
                <Select.Option
                  key={option.id}
                  value={option.id}
                  label={option.label}
                  disabled={option.id !== specializationId && selected.has(option.id)}
                />
              ))}
            </Select>
          </div>
          <IconButton
            type="button"
            size="sm"
            color="negative"
            coloringStyle="text"
            tooltip={t('deleteSpecialization')}
            disabled={value.length <= 1}
            onClick={() => {
              if (value.length <= 1) {
                return
              }
              onChange(value.filter((_, itemIndex) => itemIndex !== index))
            }}
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        color="primary"
        coloringStyle="text"
        className="self-start !min-w-0"
        disabled={!canAdd}
        onClick={() => {
          const nextId = unused[0]?.id
          if (!nextId) {
            return
          }
          onChange([...value, nextId])
        }}
      >
        <Plus className="size-4" />
        {t('addSpecialization')}
      </Button>
    </div>
  )
}

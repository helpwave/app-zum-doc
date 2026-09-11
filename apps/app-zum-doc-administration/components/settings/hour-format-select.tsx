import { Select, useDateTimeFormat } from '@helpwave/hightide'
import { useAdministrationTranslation, useLocale } from '@/i18n/useAdministrationTranslation'

type HourFormat = '12h' | '24h'

export function HourFormatSelect() {
  const t = useAdministrationTranslation()
  const { is24HourFormat } = useDateTimeFormat()
  const { setIs24HourFormat } = useLocale()
  const value: HourFormat = is24HourFormat ? '24h' : '12h'

  return (
    <Select
      value={value}
      showSearch={false}
      iconAppearance="right"
      triggerProps={{ className: 'min-w-40 w-fit' }}
      onValueChange={(next) => {
        setIs24HourFormat(next === '24h')
      }}
    >
      <Select.Option value="24h" label={t('hourFormat24')} />
      <Select.Option value="12h" label={t('hourFormat12')} />
    </Select>
  )
}

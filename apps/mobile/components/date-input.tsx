import { DatePickerSheet } from "@/components/date-picker-sheet"
import { SelectStyleInput } from "@/components/select-style-input"
import { parseIsoDate, toAppLocale } from "@app-zum-doc/utils/api"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { Calendar } from "lucide-react-native"
import { useState } from "react"

type DateInputProps = {
  value?: string
  onValueChange: (isoDate: string) => void
  placeholder: string
  title: string
  disabled?: boolean
  startDate?: string
  endDate?: string
  isDateEnabled?: (date: Date) => boolean
  hasYearSelect?: boolean
}

export function DateInput({
  value,
  onValueChange,
  placeholder,
  title,
  disabled = false,
  startDate,
  endDate,
  isDateEnabled = () => true,
  hasYearSelect = false,
}: DateInputProps) {
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <SelectStyleInput
        display={value ? formatShortDate(value, locale) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        isOpen={isOpen}
        icon={Calendar}
        accessibilityLabel={title}
        onPress={() => {
          setIsOpen(true)
        }}
      />
      <DatePickerSheet
        visible={isOpen}
        title={title}
        value={value}
        startDate={startDate}
        endDate={endDate}
        isDateEnabled={isDateEnabled}
        hasYearSelect={hasYearSelect}
        onSelect={(nextDate) => {
          onValueChange(nextDate)
          setIsOpen(false)
        }}
        onClose={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}

function formatShortDate(isoDate: string, locale: string): string {
  return parseIsoDate(isoDate).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

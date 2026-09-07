import { SelectStyleInput } from "@/components/select-style-input"
import { TimeSlotSheet } from "@/components/time-slot-sheet"
import { Clock } from "lucide-react-native"
import { useState } from "react"

type TimeSlotInputProps = {
  value?: string
  onValueChange: (time: string) => void
  slots: readonly string[]
  placeholder: string
  title: string
  disabled?: boolean
}

export function TimeSlotInput({
  value,
  onValueChange,
  slots,
  placeholder,
  title,
  disabled = false,
}: TimeSlotInputProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <SelectStyleInput
        display={value}
        placeholder={placeholder}
        disabled={disabled}
        isOpen={isOpen}
        icon={Clock}
        accessibilityLabel={title}
        onPress={() => {
          setIsOpen(true)
        }}
      />
      <TimeSlotSheet
        visible={isOpen}
        title={title}
        slots={slots}
        value={value}
        onSelect={(nextTime) => {
          onValueChange(nextTime)
          setIsOpen(false)
        }}
        onClose={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}

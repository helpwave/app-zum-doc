import { useAzdTheme } from "@/hooks/useAzdTheme"
import { Button } from "@helpwave/hightide-native/components"
import { View } from "react-native"

export type SegmentedControlOption = {
  id: string
  label: string
}

type SegmentedControlProps<T extends string> = {
  options: readonly (Omit<SegmentedControlOption, "id"> & { id: T })[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { theme } = useAzdTheme()

  return (
    <View
      style={{
        flexDirection: "row",
        gap: theme.spacing.sm,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.surface.color,
      }}
    >
      {options.map((option) => {
        const selected = option.id === value

        return (
          <Button
            key={option.id}
            size="sm"
            variant={selected ? "filled" : "foreground"}
            onPress={() => {
              onChange(option.id)
            }}
            style={{ flex: 1 }}
          >
            {option.label}
          </Button>
        )
      })}
    </View>
  )
}

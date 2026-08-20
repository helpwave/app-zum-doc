import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ThemedIcon, ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { Pencil, Plus } from "lucide-react-native"

type FilterChipProps = {
  label: string
  selected?: boolean
  onPress: () => void
}

export function FilterChip({ label, selected = false, onPress }: FilterChipProps) {
  const { theme } = useAzdTheme()
  const Icon = selected ? Pencil : Plus

  return (
    <ThemedPressable
      accessibilityRole="button"
      onPress={onPress}
      color={theme.colors.primary}
      size="sm"
      coloringStyle="filled"
      coloringColorVariant={selected ? "tonal" : "normal"}
      stateLayerStyle={{
        borderRadius: 9999,
      }}
      style={{
        borderRadius: 9999,
        gap: theme.spacing.md,
        paddingLeft: theme.padding.xl,
        paddingRight: theme.padding.xl,
      }}
    >
      <ThemedText>{label}</ThemedText>
      <ThemedIcon icon={Icon} size={theme.icongraphy.sizes.xs} />
    </ThemedPressable>
  )
}

import { useAzdTheme } from "@/hooks/useAzdTheme"
import { Chip, ThemedIcon, ThemedText } from "@helpwave/hightide-native/components"
import { Pencil, Plus } from "lucide-react-native"
import { Pressable, View } from "react-native"

type FilterChipProps = {
  label: string
  selected?: boolean
  onPress: () => void
}

export function FilterChip({ label, selected = false, onPress }: FilterChipProps) {
  const { theme } = useAzdTheme()
  const Icon = selected ? Pencil : Plus

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Chip
        variant={selected ? "tonal" : "filled"}
        color={theme.colors.primary}
        chipStyle={(previous) => ({
          ...previous,
          borderRadius: 9999,
          // TODO use padding vlaues here
          paddingLeft: theme.spacing.lg,
          paddingRight: theme.spacing.lg
        })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <ThemedText>{label}</ThemedText>
          <ThemedIcon icon={Icon} size={theme.icongraphy.sizes.xs} />
        </View>
      </Chip>
    </Pressable>
  )
}

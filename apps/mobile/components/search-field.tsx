import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { Search } from "lucide-react-native"
import { TextInput, View } from "react-native"

type SearchFieldProps = {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
}

export function SearchField({
  value,
  onChangeText,
  placeholder = "Praxis oder Nachricht suchen",
}: SearchFieldProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.searchField

  return (
    <View
      style={{
        height: theme.elements.control.sm.size,
        borderRadius: 9999,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md + theme.spacing.xs,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <Search size={theme.icongraphy.sizes.xs} color={colors.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={{
          flex: 1,
          ...theme.typography.body.md,
          color: colors.text,
          paddingVertical: 0,
        }}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  )
}

import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import { Search } from "lucide-react-native"
import { StyleSheet, TextInput, View } from "react-native"

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
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <Search size={16} color={colors.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { color: colors.text }]}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    height: 40,
    borderRadius: azdLayout.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: azdLayout.font.display,
    fontSize: 15,
    paddingVertical: 0,
  },
})

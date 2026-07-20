import { Search } from "lucide-react-native"
import { StyleSheet, TextInput, View } from "react-native"
import { azd } from "@/theme/azd-tokens"

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
  return (
    <View style={styles.shell}>
      <Search size={16} color={azd.fg[6]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={azd.fg[7]}
        style={styles.input}
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
    borderRadius: azd.radius.pill,
    backgroundColor: azd.bg.app,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: azd.font.display,
    fontSize: 15,
    color: azd.fg[1],
    paddingVertical: 0,
  },
})

import { useTheme } from "@helpwave/hightide-native/global-contexts"
import { ActivityIndicator, Text, View } from "react-native"

export function LoadingView() {
  const { theme } = useTheme()
  const color = theme.colors.primary.color

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={color} />
      <Text>Initializing</Text>
    </View>
  )
}

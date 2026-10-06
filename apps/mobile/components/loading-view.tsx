import { AppZumDocLogo } from "@/components/app-zum-doc-logo"
import { useTheme } from "@helpwave/hightide-native/global-contexts"
import { Text, View } from "react-native"

export function LoadingView() {
  const { theme } = useTheme()
  const color = theme.colors.primary.color

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <AppZumDocLogo animate="loading" height={128} width={128} />
      <Text style={{ color, ...theme.typography.body.md }}>Initializing</Text>
    </View>
  )
}

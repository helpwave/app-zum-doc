import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ThemedText } from "@helpwave/hightide-native/components"
import type { ReactNode } from "react"
import { View } from "react-native"
import { AppBar } from "./app-bar"

type PlaceholderScreenProps = {
  title: string
  description?: string
  onBack: () => void
  children?: ReactNode
}

export function PlaceholderScreen({
  title,
  description,
  onBack,
  children,
}: PlaceholderScreenProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar title={title} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: theme.spacing.xl,
        }}
      >
        {children ?? (
          <ThemedText
            style={{
              ...theme.typography.body.md,
              textAlign: "center",
            }}
            appearance="description"
          >
            {description ?? t("placeholderComingSoon")}
          </ThemedText>
        )}
      </View>
    </View>
  )
}

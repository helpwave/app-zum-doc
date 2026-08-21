import { useAppTranslation } from "@/hooks/useAppTranslation"
import { NavigationHeader } from "@/components/navigation-header"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ThemedText } from "@helpwave/hightide-native/components"
import type { ReactNode } from "react"
import { View } from "react-native"

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
  const colors = theme.components.screen

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <NavigationHeader title={title} onBack={onBack} />
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

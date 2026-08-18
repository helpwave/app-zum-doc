import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { ThemedText } from "@helpwave/hightide-native/components"
import { ChevronLeft } from "lucide-react-native"
import type { ReactNode } from "react"
import { Pressable, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

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
  const headerColors = theme.components.screenHeader
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.lg - theme.spacing.xs,
          paddingBottom: theme.spacing.lg - theme.spacing.xs,
          borderBottomWidth: theme.border.thin,
          borderBottomColor: headerColors.border,
          backgroundColor: headerColors.background,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={onBack}
          hitSlop={theme.spacing.md}
          style={{
            width: theme.elements.control.xs.size,
            alignItems: "flex-start",
          }}
        >
          <ChevronLeft
            size={theme.icongraphy.sizes.md}
            color={theme.colors.primary.color}
          />
        </Pressable>
        <Text
          style={{
            ...theme.typography.heading.md,
            color: headerColors.title,
          }}
        >
          {title}
        </Text>
        <View
          style={{
            width: theme.elements.control.xs.size,
          }}
        />
      </View>
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

import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ContentThemeOverrideProvider } from "@helpwave/hightide-native/global-contexts"
import { ChevronLeft } from "lucide-react-native"
import type { ReactNode } from "react"
import { Pressable, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type NavigationHeaderProps = {
  title: string
  onBack: () => void
  trailing?: ReactNode
}

export function NavigationHeader({
  title,
  onBack,
  trailing,
}: NavigationHeaderProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const headerColors = theme.components.screenHeader
  const insets = useSafeAreaInsets()
  const onSurface = theme.colors.surface.onColor

  return (
    <ContentThemeOverrideProvider foreground={onSurface}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.lg - theme.spacing.xs,
          paddingBottom: theme.spacing.lg - theme.spacing.xs,
          borderBottomWidth: theme.borderWidth.thin,
          borderBottomColor: headerColors.border,
          backgroundColor: theme.colors.surface.color,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={onBack}
          hitSlop={theme.spacing.md}
          style={{
            width: theme.semantics.control.xs.size,
            alignItems: "flex-start",
          }}
        >
          <ChevronLeft
            size={theme.icongraphy.sizes.md}
            color={onSurface}
          />
        </Pressable>
        <Text
          style={{
            ...theme.typography.heading.md,
            color: onSurface,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View
          style={{
            width: theme.semantics.control.xs.size,
            alignItems: "flex-end",
          }}
        >
          {trailing}
        </View>
      </View>
    </ContentThemeOverrideProvider>
  )
}

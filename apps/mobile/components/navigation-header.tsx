import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
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

  return (
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
        backgroundColor: headerColors.background,
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
          color={theme.colors.primary.color}
        />
      </Pressable>
      <Text
        style={{
          ...theme.typography.heading.md,
          color: headerColors.title,
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
  )
}

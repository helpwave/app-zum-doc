import { useAzdTheme } from "@/hooks/useAzdTheme"
import type { ReactNode } from "react"
import { Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type ScreenHeaderProps = {
  title: string
  trailing?: ReactNode
  children?: ReactNode
}

export function ScreenHeader({ title, trailing, children }: ScreenHeaderProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.screenHeader
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.lg + theme.spacing.sm,
        paddingBottom: theme.spacing.lg - theme.spacing.xs,
        gap: theme.spacing.lg - theme.spacing.xs,
        borderBottomWidth: theme.border.thin,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            ...theme.typography.heading.lg,
            fontWeight: theme.typography.fontWeights.bold,
            color: colors.title,
          }}
        >
          {title}
        </Text>
        {trailing}
      </View>
      {children}
    </View>
  )
}

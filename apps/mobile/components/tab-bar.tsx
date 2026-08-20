import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ThemedPressable } from "@helpwave/hightide-native/components"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { Home, MessageCircle, UserRound } from "lucide-react-native"
import { Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const tabIcons = {
  index: Home,
  chat: MessageCircle,
  profile: UserRound,
} as const

export function AzdTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.tabBar
  const insets = useSafeAreaInsets()
  const labels = {
    index: t("tabStart"),
    chat: t("tabChats"),
    profile: t("tabProfile"),
  } as const

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-around",
        paddingTop: theme.spacing.sm,
        paddingBottom: insets.bottom + theme.spacing.sm,
        paddingLeft: insets.left + theme.spacing.md,
        paddingRight: insets.right + theme.spacing.md,
        borderTopWidth: theme.borderWidth.thin,
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      }}
    >
      {state.routes.map((route, index) => {
        const selected = state.index === index
        const Icon = tabIcons[route.name as keyof typeof tabIcons]
        const label = labels[route.name as keyof typeof labels]
          ?? descriptors[route.key]?.options.title
          ?? route.name

        return (
          <ThemedPressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: selected }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              })

              if (!selected && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params)
              }
            }}
            onLongPress={() => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              })
            }}
            style={{
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              gap: theme.spacing.xs,
              paddingLeft: theme.spacing.sm,
              paddingRight: theme.spacing.sm,
              paddingTop: theme.spacing.xs,
              paddingBottom: theme.spacing.xs,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: 999,
                overflow: "hidden",
                backgroundColor: selected ? colors.activeBackground : "#FFFFFF00",
              }}
            >
                <Icon
                  size={theme.icongraphy.sizes.md}
                  color={selected ? colors.activeForeground : colors.inactive}
                />
            </View>
            <Text
              style={{
                ...theme.typography.label.sm,
                color: selected ? theme.colors.primary.color : colors.inactive,
                fontWeight: selected
                  ? theme.fontWeights.bold
                  : theme.fontWeights.medium,
              }}
            >
              {label}
            </Text>
          </ThemedPressable>
        )
      })}
    </View>
  )
}

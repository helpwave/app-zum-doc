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

type VisibleTab = keyof typeof tabIcons

function highlightedTab(routeName: string): VisibleTab | null {
  if (routeName === "index" || routeName === "doctor/[id]" || routeName === "requests") {
    return "index"
  }
  if (routeName === "chat") {
    return "chat"
  }
  if (routeName === "profile" || routeName === "personal-information" || routeName === "medications") {
    return "profile"
  }
  return null
}

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
  const activeTab = highlightedTab(state.routes[state.index]?.name ?? "")
  const visibleRoutes = state.routes.filter(
    (route): route is typeof route & { name: VisibleTab } =>
      route.name in tabIcons,
  )

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
      {visibleRoutes.map((route) => {
        const selected = activeTab === route.name
        const Icon = tabIcons[route.name]
        const label = labels[route.name]
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

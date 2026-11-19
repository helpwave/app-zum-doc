import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { ThemedPressable } from "@helpwave/hightide-native/components"
import { Tabs } from "expo-router"
import { Home, MessageCircle, UserRound } from "lucide-react-native"
import { type ComponentProps } from "react"
import { Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0]

const tabIcons = {
  index: Home,
  chat: MessageCircle,
  profile: UserRound,
} as const

type VisibleTab = keyof typeof tabIcons

function highlightedTab(routeName: string): VisibleTab | null {
  if (routeName === "index" || routeName === "chat" || routeName === "profile") {
    return routeName
  }
  return null
}

export function AzdTabBar({ state, descriptors, emitter, navigateToTab }: TabBarProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
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
        backgroundColor: theme.colors.surface.color,
        borderTopColor: theme.colors.border,
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
              const event = emitter.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              })

              if (!selected && !event.defaultPrevented) {
                navigateToTab(route.key)
              }
            }}
            onLongPress={() => {
              emitter.emit({
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
                backgroundColor: selected ? theme.colors.primary.color : "#FFFFFF00",
              }}
            >
              <Icon
                size={theme.icongraphy.sizes.md}
                color={selected ? theme.colors.primary.onColor : theme.semantics.asDescription({colorPair: theme.colors.surface})}
              />
            </View>
            <Text
              style={{
                ...theme.typography.label.sm,
                color: selected ? theme.colors.primary.color :  theme.semantics.asDescription({colorPair: theme.colors.surface}),
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

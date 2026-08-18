import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { Tabs } from "expo-router"
import { Home, MessageCircle, UserRound } from "lucide-react-native"
import { Text, View } from "react-native"
import { useAppTranslation } from "../hooks/useAppTranslation"

type TabIconProps = {
  focused: boolean
  icon: "home" | "chat" | "profile"
}

function TabItem({ focused, icon }: TabIconProps) {
  const { theme } = useAzdTheme()
  const colors = theme.components.tabBar
  const Icon =
    icon === "home" ? Home : icon === "chat" ? MessageCircle : UserRound
  const color = focused ? colors.activeForeground : colors.inactive

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.spacing.sm + theme.spacing.xs,
        paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
        borderRadius: 9999,
        backgroundColor: focused ? colors.activeBackground : undefined,
      }}
    >
      <Icon size={theme.icongraphy.sizes.md} color={color} />
    </View>
  )
}

export default function TabsLayout() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.tabBar
  const backgroundColor = theme.components.screen.background

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor },
        tabBarActiveTintColor: theme.colors.primary.color,
        tabBarInactiveTintColor: colors.inactive,
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              ...theme.typography.label.sm,
              color,
              fontWeight: focused
                ? theme.typography.fontWeights.bold
                : theme.typography.fontWeights.medium,
            }}
          >
            {children}
          </Text>
        ),
        tabBarStyle: {
          height: theme.elements.control.xl.size + theme.spacing.md,
          paddingTop: theme.spacing.md + theme.spacing.sm,
          paddingBottom: 0,
          paddingHorizontal: theme.spacing.lg + theme.spacing.sm,
          borderTopWidth: theme.border.thin,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabStart"),
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} icon="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabChats"),
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} icon="chat" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabProfile"),
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} icon="profile" />
          ),
        }}
      />
    </Tabs>
  )
}

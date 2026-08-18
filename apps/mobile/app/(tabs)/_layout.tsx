import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import { Tabs } from "expo-router"
import { Home, MessageCircle, UserRound } from "lucide-react-native"
import { StyleSheet, Text, View } from "react-native"
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
      style={[
        styles.chip,
        focused && { backgroundColor: colors.activeBackground },
      ]}
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
            style={[
              styles.label,
              { color, fontWeight: focused ? "700" : "500" },
            ]}
          >
            {children}
          </Text>
        ),
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ],
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

const styles = StyleSheet.create({
  tabBar: {
    height: 82,
    paddingTop: 12,
    paddingBottom: 0,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: azdLayout.radius.pill,
  },
  label: {
    fontFamily: azdLayout.font.display,
    fontSize: 11,
  },
})

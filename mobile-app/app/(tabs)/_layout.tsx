import { MessageCircle, Home, UserRound } from "lucide-react-native"
import { Tabs } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import { azd } from "@/theme/azd-tokens"

type TabIconProps = {
  focused: boolean
  label: string
  icon: "home" | "chat" | "profile"
}

function TabItem({ focused, label, icon }: TabIconProps) {
  const Icon =
    icon === "home" ? Home : icon === "chat" ? MessageCircle : UserRound
  const color = focused ? "#FFFFFF" : azd.fg[7]

  if (focused) {
    return (
      <View style={styles.activePill}>
        <Icon size={22} color={color} />
        <Text style={styles.activeLabel}>{label}</Text>
      </View>
    )
  }

  return (
    <View style={styles.inactiveItem}>
      <Icon size={24} color={color} />
      <Text style={styles.inactiveLabel}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Start",
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} label="Start" icon="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} label="Chats" icon="chat" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} label="Profil" icon="profile" />
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
    backgroundColor: azd.bg.surface,
    borderTopColor: azd.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: azd.radius.pill,
    backgroundColor: azd.green[300],
  },
  activeLabel: {
    fontFamily: azd.font.display,
    fontWeight: "500",
    fontSize: 14,
    color: "#FFFFFF",
  },
  inactiveItem: {
    width: 70,
    alignItems: "center",
    gap: 5,
  },
  inactiveLabel: {
    fontFamily: azd.font.display,
    fontWeight: "500",
    fontSize: 11,
    color: azd.fg[7],
  },
})

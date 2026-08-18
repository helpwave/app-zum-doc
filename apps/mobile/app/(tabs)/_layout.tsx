import { AzdTabBar } from "@/components/tab-bar"
import { Tabs } from "expo-router"

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AzdTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}

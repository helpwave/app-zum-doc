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
      <Tabs.Screen name="doctors" />
      <Tabs.Screen name="doctor-search" />
      <Tabs.Screen name="doctor/[id]" />
      <Tabs.Screen name="personal-information" />
      <Tabs.Screen name="medications" />
      <Tabs.Screen name="requests" />
    </Tabs>
  )
}

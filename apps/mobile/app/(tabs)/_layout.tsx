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
      <Tabs.Screen
        name="doctors"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="doctor-search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="doctor/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="personal-information"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

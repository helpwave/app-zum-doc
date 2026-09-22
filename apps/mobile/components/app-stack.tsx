import { StatusBar } from "@/components/status-bar"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { Stack } from "expo-router"
import * as SystemUI from "expo-system-ui"
import { useEffect } from "react"

export function AppStack() {
  const { theme } = useAzdTheme()

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background.color)
  }, [theme.colors.background.color])

  return (
    <>
      <StatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background.color },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="migration"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="manage-profiles"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="create-profile"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/prescription/create"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/prescription/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/appointment/create"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/appointment/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/referral/create"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/referral/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  )
}

import { StatusBar } from "@/components/status-bar"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { queryClient } from "@/lib/query-client"
import { azdSupportedThemes } from "@/theme/azd-theme"
import { appZumDocTranslation } from "@app-zum-doc/utils/i18n"
import { HightideProvider, useHightide, useTheme } from "@helpwave/hightide-native/global-contexts"
import { QueryClientProvider } from "@tanstack/react-query"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import * as SystemUI from "expo-system-ui"
import { useEffect, type ReactNode } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

SplashScreen.preventAutoHideAsync().catch(() => undefined)

function LoadingView() {
  const { theme } = useTheme()
  const color = theme.colors.primary.color

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={color} />
      <Text>Initializing</Text>
    </View>
  )
}

function AppStack() {
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
          name="chat/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="doctor-search"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="doctors"
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

function HightideGate({ children }: { children: ReactNode }) {
  const { isLocalizationInitialized, isThemeInitialized } = useHightide()

  const initialized =
    isLocalizationInitialized && isThemeInitialized

  useEffect(() => {
    if (initialized) {
      void SplashScreen.hideAsync()
    }
  }, [initialized])

  if (!initialized) {
    return <LoadingView />
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <HightideProvider
        theme={{
          supportedThemes: azdSupportedThemes,
          fallbackTheme: "light",
        }}
        translation={{ translation: appZumDocTranslation }}
      >
        <SafeAreaProvider>
          <HightideGate>            
            <AppStack />
          </HightideGate>
        </SafeAreaProvider>
      </HightideProvider>
    </QueryClientProvider>
  )
}

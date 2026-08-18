import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { queryClient } from "@/lib/query-client"
import { azdSupportedThemes } from "@/theme/azd-theme"
import { appZumDocTranslation } from "@app-zum-doc/utils/i18n"
import { HightideProvider, useHightide, useTheme } from "@helpwave/hightide-native/global-contexts"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
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
  const { theme, themeMode } = useAzdTheme()
  const backgroundColor = theme.components.screen.background
  const baseTheme = themeMode === "dark" ? DarkTheme : DefaultTheme

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(backgroundColor)
  }, [backgroundColor])

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: backgroundColor,
          card: backgroundColor,
        },
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor },
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
          name="doctor/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="search"
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
          name="requests/index"
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
          name="requests/prescription"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/appointment"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="requests/referral"
          options={{
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}

function HightideGate({ children }: { children: ReactNode }) {
  const { isLocalizationInitialized, isThemeInitialized } = useHightide()

  if (!isLocalizationInitialized || !isThemeInitialized) {
    return <LoadingView />
  }

  return <>{children}</>
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk: require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
    Inter: require("../assets/fonts/Inter_28pt-Regular.ttf"),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined)
    }
  }, [fontsLoaded, fontError])

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
             {!fontsLoaded && !fontError ? (
              <LoadingView />
            ) : (
              <AppStack />
            )}
          </HightideGate>
        </SafeAreaProvider>
      </HightideProvider>
    </QueryClientProvider>
  )
}

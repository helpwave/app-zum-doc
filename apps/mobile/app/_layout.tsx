import { HightideProvider, useHightide } from "@helpwave/hightide-native/global-contexts"
import { QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, type ReactNode } from "react"
import { ActivityIndicator, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { queryClient } from "@/lib/query-client"
import { azd } from "@/theme/azd-tokens"

SplashScreen.preventAutoHideAsync().catch(() => undefined)

function LoadingView() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={azd.green[600]} />
    </View>
  )
}

function AppStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="chat/[id]"
        options={{
          animation: "slide_from_right",
          headerShown: false,
        }}
      />
    </Stack>
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

  if (!fontsLoaded && !fontError) {
    return <LoadingView />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HightideProvider>
        <SafeAreaProvider>
          <HightideGate>
            <AppStack />
          </HightideGate>
        </SafeAreaProvider>
      </HightideProvider>
    </QueryClientProvider>
  )
}

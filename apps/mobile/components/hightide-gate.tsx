import { LoadingView } from "@/components/loading-view"
import { useHightide } from "@helpwave/hightide-native/global-contexts"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, type ReactNode } from "react"

SplashScreen.preventAutoHideAsync().catch(() => undefined)

export function HightideGate({ children }: { children: ReactNode }) {
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

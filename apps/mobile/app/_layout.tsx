import { AppStack } from "@/components/app-stack"
import { HightideGate } from "@/components/hightide-gate"
import { queryClient } from "@/lib/query-client"
import "@/styles/web-font"
import { azdSupportedThemes } from "@/theme/azd-theme"
import { appZumDocTranslation } from "@app-zum-doc/utils/i18n"
import { HightideProvider } from "@helpwave/hightide-native/global-contexts"
import { QueryClientProvider } from "@tanstack/react-query"
import { SafeAreaProvider } from "react-native-safe-area-context"

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

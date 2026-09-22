import { installBackupQuickCrypto } from "@/lib/install-backup-crypto"
import { AppStack } from "@/components/app-stack"
import { HightideGate } from "@/components/hightide-gate"
import { useBackupShareIntent } from "@/hooks/useBackupShareIntent"
import { queryClient } from "@/lib/query-client"
import "@/styles/web-font"
import { azdSupportedThemes } from "@/theme/azd-theme"
import { appZumDocTranslation } from "@app-zum-doc/utils/i18n"
import { HightideProvider } from "@helpwave/hightide-native/global-contexts"
import { QueryClientProvider } from "@tanstack/react-query"
import { ShareIntentProvider } from "expo-share-intent"
import { Platform } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

installBackupQuickCrypto()

function AppContent() {
  useBackupShareIntent()

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

export default function RootLayout() {
  return (
    <ShareIntentProvider options={{ disabled: Platform.OS === "web" }}>
      <AppContent />
    </ShareIntentProvider>
  )
}

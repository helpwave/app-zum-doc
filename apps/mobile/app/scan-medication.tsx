import { AppBar } from "@/components/app-bar"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { pznFromBarcode } from "@app-zum-doc/utils/api"
import { getApiClient } from "@app-zum-doc/utils/hooks"
import { Button, ThemedText } from "@helpwave/hightide-native/components"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useRouter, type Href } from "expo-router"
import { useState } from "react"
import { View } from "react-native"

export default function ScanMedicationScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const openScannedProduct = (catalogId: string, catalogName: string, catalogIngredient: string) => {
    const id = encodeURIComponent(catalogId)
    const name = encodeURIComponent(catalogName)
    const ingredient = encodeURIComponent(catalogIngredient)
    router.navigate(`/(tabs)/medications?catalogId=${id}&catalogName=${name}&catalogIngredient=${ingredient}` as Href)
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar title={t("scanMedication")} />
      {permission == null ? null : permission.granted ? (
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "code128", "code39", "datamatrix", "qr"],
          }}
          onBarcodeScanned={busy ? undefined : ({ data }) => {
            const pzn = pznFromBarcode(data)
            if (!pzn) {
              setMessage(t("noSearchResults"))
              return
            }
            setBusy(true)
            setMessage(null)
            void getApiClient().searchMedicationByPzn(pzn).then((result) => {
              if (!result.hasResult || result.results == null) {
                setBusy(false)
                setMessage(t("noSearchResults"))
                return
              }
              openScannedProduct(
                result.results.id,
                result.results.name,
                result.results.ingredient ?? "",
              )
            }).catch(() => {
              setBusy(false)
              setMessage(t("errorTitle"))
            })
          }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
        >
          <ThemedText
            appearance="description"
            style={{
              ...theme.typography.body.md,
              textAlign: "center",
            }}
          >
            {t("cameraPermissionDenied")}
          </ThemedText>
          <Button
            onPress={() => {
              void requestPermission()
            }}
          >
            {t("openSettings")}
          </Button>
        </View>
      )}
      {message ? (
        <ThemedText
          appearance="description"
          style={{
            ...theme.typography.body.md,
            textAlign: "center",
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
          }}
        >
          {message}
        </ThemedText>
      ) : null}
    </View>
  )
}

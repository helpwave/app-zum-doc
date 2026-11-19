import { AppBar } from "@/components/app-bar"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  setScannedMedication,
  setScannedMedicationNotFound,
} from "@/state/scanned-medication"
import {
  MedicalProductSearchUnavailableError,
  pznFromBarcode,
  type MedicationBarcodeFormat,
  type MedicationCatalogItem,
} from "@app-zum-doc/utils/api"
import { getApiClient } from "@app-zum-doc/utils/hooks"
import { Button, ThemedText } from "@helpwave/hightide-native/components"
import {
  CameraView,
  useCameraPermissions,
  type BarcodeType,
} from "expo-camera"
import { useFocusEffect, useRouter, type Href } from "expo-router"
import { useCallback, useRef, useState } from "react"
import { View } from "react-native"

const barcodeTypes: BarcodeType[] = ["code39", "datamatrix"]

function medicationBarcodeFormat(type: string | number): MedicationBarcodeFormat | null {
  if (type === 2 || type === "2" || type === "code39") {
    return "code39"
  }
  if (type === 16 || type === "16" || type === "datamatrix") {
    return "datamatrix"
  }
  const name = String(type).toLowerCase().replace(/[^a-z0-9]/g, "")
  if (name.includes("code39")) {
    return "code39"
  }
  if (name.includes("datamatrix")) {
    return "datamatrix"
  }
  return null
}

export default function ScanMedicationScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [useEmbeddedCamera, setUseEmbeddedCamera] = useState(
    !CameraView.isModernBarcodeScannerAvailable,
  )
  const scanLock = useRef(false)

  const returnToPreviousScreen = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace("/(tabs)/medications" as Href)
  }, [router])

  const finishWithMedication = useCallback((item: MedicationCatalogItem) => {
    setScannedMedication(item)
    returnToPreviousScreen()
  }, [returnToPreviousScreen])

  const acceptBarcode = useCallback((type: string | number, data: string, raw?: string) => {
    if (scanLock.current) {
      return
    }
    const format = medicationBarcodeFormat(type)
    const pzn = format == null
      ? null
      : (raw ? pznFromBarcode(raw, format) : null) ?? pznFromBarcode(data, format)
    if (!pzn) {
      setMessage(t("noSearchResults"))
      return
    }
    scanLock.current = true
    setBusy(true)
    setMessage(null)
    void getApiClient().searchMedicationByPzn(pzn).then((result) => {
      if (!result.hasResult || result.results == null) {
        setScannedMedicationNotFound()
        returnToPreviousScreen()
        return
      }
      finishWithMedication(result.results)
    }).catch((error: unknown) => {
      scanLock.current = false
      setBusy(false)
      setMessage(
        error instanceof MedicalProductSearchUnavailableError
          ? t("medicationSearchUnavailable")
          : t("errorTitle"),
      )
    })
  }, [finishWithMedication, returnToPreviousScreen, t])

  const acceptBarcodeRef = useRef(acceptBarcode)
  acceptBarcodeRef.current = acceptBarcode

  const openScanner = useCallback(() => {
    if (!CameraView.isModernBarcodeScannerAvailable) {
      setUseEmbeddedCamera(true)
      return
    }
    void CameraView.launchScanner({
      barcodeTypes,
      isGuidanceEnabled: true,
      isHighlightingEnabled: true,
    }).catch((error: unknown) => {
      const code = typeof error === "object" && error != null && "code" in error
        ? String(error.code)
        : ""
      const text = error instanceof Error ? error.message : ""
      const cancelled = code.toLowerCase().includes("cancel") || text.toLowerCase().includes("cancel")
      if (!cancelled) {
        setUseEmbeddedCamera(true)
      }
    })
  }, [])

  useFocusEffect(useCallback(() => {
    if (!permission?.granted || useEmbeddedCamera) {
      return
    }
    const subscription = CameraView.onModernBarcodeScanned(({ type, data, raw }) => {
      void CameraView.dismissScanner()
      console.log("type", type)
      acceptBarcodeRef.current(
        type,
        typeof data === "string" ? data : "",
        typeof raw === "string" ? raw : undefined,
      )
    })
    openScanner()
    return () => {
      subscription.remove()
      void CameraView.dismissScanner()
    }
  }, [openScanner, permission?.granted, useEmbeddedCamera]))

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar title={t("scanMedication")} />
      {permission == null ? null : permission.granted ? (
        useEmbeddedCamera ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            mode="picture"
            autofocus={cameraReady ? "on" : "off"}
            barcodeScannerSettings={{ barcodeTypes }}
            onCameraReady={() => {
              setCameraReady(true)
            }}
            onBarcodeScanned={cameraReady
              ? ({ type, data, raw }) => {
                acceptBarcode(
                  type,
                  typeof data === "string" ? data : "",
                  typeof raw === "string" ? raw : undefined,
                )
              }
              : undefined}
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
            {message ? (
              <ThemedText
                appearance="description"
                style={{
                  ...theme.typography.body.md,
                  textAlign: "center",
                }}
              >
                {message}
              </ThemedText>
            ) : (
              <ThemedText
                appearance="description"
                style={{
                  ...theme.typography.body.md,
                  textAlign: "center",
                }}
              >
                {busy ? t("loadingMedications") : t("scanMedication")}
              </ThemedText>
            )}
            <Button
              disabled={busy}
              onPress={openScanner}
            >
              {t("scanMedication")}
            </Button>
          </View>
        )
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
      {useEmbeddedCamera && message ? (
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

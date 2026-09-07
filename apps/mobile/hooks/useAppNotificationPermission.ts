import { useAppTranslation } from "@/hooks/useAppTranslation"
import * as Notifications from "expo-notifications"
import { useCallback, useEffect, useState } from "react"
import { AppState, Linking, Platform } from "react-native"

export type NotificationSettingsPrompt = {
  title: string
  message: string
}

async function getNotificationPermissionGranted(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false
  }

  const permission = await Notifications.getPermissionsAsync()
  return permission.granted || permission.status === Notifications.PermissionStatus.GRANTED
}

export function useAppNotificationPermission() {
  const t = useAppTranslation()
  const [enabled, setEnabled] = useState(false)
  const [settingsPrompt, setSettingsPrompt] = useState<NotificationSettingsPrompt | null>(null)

  const refresh = useCallback(async () => {
    const granted = await getNotificationPermissionGranted()
    setEnabled(granted)
  }, [])

  useEffect(() => {
    void refresh()

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refresh()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [refresh])

  const promptOpenSettings = useCallback((title: string, message: string) => {
    setSettingsPrompt({ title, message })
  }, [])

  const dismissSettingsPrompt = useCallback(() => {
    setSettingsPrompt(null)
  }, [])

  const confirmOpenSettings = useCallback(() => {
    setSettingsPrompt(null)
    void Linking.openSettings()
  }, [])

  const setNotificationsEnabled = useCallback(async (nextEnabled: boolean) => {
    if (Platform.OS === "web") {
      return
    }

    const permission = await Notifications.getPermissionsAsync()
    const isGranted =
      permission.granted || permission.status === Notifications.PermissionStatus.GRANTED

    if (nextEnabled === isGranted) {
      setEnabled(isGranted)
      return
    }

    if (nextEnabled) {
      const canRequest =
        permission.status === Notifications.PermissionStatus.UNDETERMINED
        || permission.canAskAgain

      if (canRequest) {
        const result = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        })
        const granted =
          result.granted || result.status === Notifications.PermissionStatus.GRANTED
        setEnabled(granted)

        if (!granted) {
          promptOpenSettings(
            t("notificationsEnableTitle"),
            t("notificationsEnableMessage"),
          )
        }
        return
      }

      promptOpenSettings(
        t("notificationsEnableTitle"),
        t("notificationsEnableMessage"),
      )
      return
    }

    promptOpenSettings(
      t("notificationsDisableTitle"),
      t("notificationsDisableMessage"),
    )
  }, [promptOpenSettings, t])

  return {
    notificationsEnabled: enabled,
    setNotificationsEnabled,
    settingsPrompt,
    confirmOpenSettings,
    dismissSettingsPrompt,
  }
}

import { useAppTranslation } from "@/hooks/useAppTranslation"
import * as Notifications from "expo-notifications"
import { useCallback, useEffect, useState } from "react"
import { Alert, AppState, Linking, Platform } from "react-native"

async function getNotificationPermissionGranted(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false
  }

  const permission = await Notifications.getPermissionsAsync()
  return permission.granted || permission.status === Notifications.PermissionStatus.GRANTED
}

function promptOpenSettings(title: string, message: string, openSettingsLabel: string, cancelLabel: string) {
  Alert.alert(title, message, [
    {
      text: cancelLabel,
      style: "cancel",
    },
    {
      text: openSettingsLabel,
      onPress: () => {
        void Linking.openSettings()
      },
    },
  ])
}

export function useAppNotificationPermission() {
  const t = useAppTranslation()
  const [enabled, setEnabled] = useState(false)

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
            t("openSettings"),
            t("cancel"),
          )
        }
        return
      }

      promptOpenSettings(
        t("notificationsEnableTitle"),
        t("notificationsEnableMessage"),
        t("openSettings"),
        t("cancel"),
      )
      return
    }

    promptOpenSettings(
      t("notificationsDisableTitle"),
      t("notificationsDisableMessage"),
      t("openSettings"),
      t("cancel"),
    )
  }, [t])

  return {
    notificationsEnabled: enabled,
    setNotificationsEnabled,
  }
}

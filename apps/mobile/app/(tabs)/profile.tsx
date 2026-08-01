import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import {
  LocaleSetting,
  ProfileHeader,
  ProfileNavRow,
  ThemeModeSetting
} from "@/components/profile-sections"
import { QueryState } from "@/components/query-state"
import { azdLayout } from "@/theme/azd-tokens"
import { usePatientProfile } from "@app-zum-doc/utils/hooks"
import { Menu, MenuItem, Switch } from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTranslation } from "../hooks/useAppTranslation"

export default function ProfileScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const profileQuery = usePatientProfile()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (profileQuery.data) {
      setNotificationsEnabled(profileQuery.data.notificationsEnabled)
    }
  }, [profileQuery.data])

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <QueryState
        isPending={profileQuery.isPending}
        isError={profileQuery.isError}
        error={profileQuery.error}
        onRetry={() => {
          void profileQuery.refetch()
        }}
        loadingLabel={t("loadingProfile")}
        style={{ backgroundColor: colors.background }}
      >
        {profileQuery.data ? (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ProfileHeader profile={profileQuery.data} />

            <Menu title={t("personalData")}>
              <MenuItem label={t("name")} value={profileQuery.data.fullName} />
              <MenuItem
                label={t("dateOfBirth")}
                value={profileQuery.data.dateOfBirth}
              />
              <MenuItem label={t("email")} value={profileQuery.data.email} />
              <MenuItem label={t("phone")} value={profileQuery.data.phone} />
            </Menu>

            <Menu title={t("practiceSection")}>
              <MenuItem
                label={t("practice")}
                value={profileQuery.data.practiceName}
              />
              <MenuItem
                label={t("address")}
                value={profileQuery.data.practiceAddress}
              />
              <ProfileNavRow
                icon="practice"
                label={t("practiceDetails")}
                onPress={() => {
                  router.push({
                    pathname: "/doctor/[id]",
                    params: { id: "office-moser" },
                  })
                }}
              />
            </Menu>

            <Menu title={t("settingsSection")}>
              <ProfileNavRow
                icon="bell"
                label={t("notifications")}
                trailing={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                }
              />
              <ThemeModeSetting />
              <LocaleSetting />
              <ProfileNavRow
                icon="user"
                label={t("editPersonalData")}
                onPress={() => {
                  Alert.alert(t("tabProfile"), "Bearbeiten ist hier noch nicht verfügbar.")
                }}
              />
              <ProfileNavRow
                icon="logout"
                label={t("signOut")}
                danger
                onPress={() => {
                  Alert.alert(t("signOut"), "Sie sind in dieser Demo nicht angemeldet.")
                }}
              />
            </Menu>
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: azdLayout.space[4],
    paddingBottom: azdLayout.space[8],
  },
})

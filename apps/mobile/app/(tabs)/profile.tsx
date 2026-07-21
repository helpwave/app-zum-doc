import {
  useAppTranslation,
  usePatientProfile,
} from "app-zum-doc-utils/hooks"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  NotificationToggle,
  ProfileHeader,
  ProfileInfoRow,
  ProfileNavRow,
  ProfileSection,
} from "@/components/profile-sections"
import { QueryState } from "@/components/query-state"
import { azd } from "@/theme/azd-tokens"

export default function ProfileScreen() {
  const t = useAppTranslation()
  const insets = useSafeAreaInsets()
  const profileQuery = usePatientProfile()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (profileQuery.data) {
      setNotificationsEnabled(profileQuery.data.notificationsEnabled)
    }
  }, [profileQuery.data])

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <QueryState
        isPending={profileQuery.isPending}
        isError={profileQuery.isError}
        error={profileQuery.error}
        onRetry={() => {
          void profileQuery.refetch()
        }}
        loadingLabel={t("loadingProfile")}
        style={styles.query}
      >
        {profileQuery.data ? (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ProfileHeader profile={profileQuery.data} />

            <ProfileSection title={t("personalData")}>
              <ProfileInfoRow label={t("name")} value={profileQuery.data.fullName} />
              <ProfileInfoRow
                label={t("dateOfBirth")}
                value={profileQuery.data.dateOfBirth}
              />
              <ProfileInfoRow label={t("email")} value={profileQuery.data.email} />
              <ProfileInfoRow label={t("phone")} value={profileQuery.data.phone} />
            </ProfileSection>

            <ProfileSection title={t("practiceSection")}>
              <ProfileInfoRow
                label={t("practice")}
                value={profileQuery.data.practiceName}
              />
              <ProfileInfoRow
                label={t("address")}
                value={profileQuery.data.practiceAddress}
              />
              <ProfileNavRow
                icon="practice"
                label={t("practiceDetails")}
                onPress={() => {
                  Alert.alert(t("practice"), "Details folgen in einem späteren Release.")
                }}
              />
            </ProfileSection>

            <ProfileSection title={t("settingsSection")}>
              <NotificationToggle
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
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
            </ProfileSection>
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: azd.bg.app,
  },
  query: {
    backgroundColor: azd.bg.app,
  },
  content: {
    paddingHorizontal: azd.space[4],
    paddingBottom: azd.space[8],
  },
})

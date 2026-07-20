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
import { usePatientProfile } from "@/hooks/use-patient-profile"
import { azd } from "@/theme/azd-tokens"

export default function ProfileScreen() {
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
        loadingLabel="Profil wird geladen…"
        style={styles.query}
      >
        {profileQuery.data ? (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ProfileHeader profile={profileQuery.data} />

            <ProfileSection title="Persönliche Daten">
              <ProfileInfoRow label="Name" value={profileQuery.data.fullName} />
              <ProfileInfoRow
                label="Geburtsdatum"
                value={profileQuery.data.dateOfBirth}
              />
              <ProfileInfoRow label="E-Mail" value={profileQuery.data.email} />
              <ProfileInfoRow label="Telefon" value={profileQuery.data.phone} />
            </ProfileSection>

            <ProfileSection title="Praxis">
              <ProfileInfoRow
                label="Praxis"
                value={profileQuery.data.practiceName}
              />
              <ProfileInfoRow
                label="Adresse"
                value={profileQuery.data.practiceAddress}
              />
              <ProfileNavRow
                icon="practice"
                label="Praxisdetails"
                onPress={() => {
                  Alert.alert("Praxis", "Details folgen in einem späteren Release.")
                }}
              />
            </ProfileSection>

            <ProfileSection title="Einstellungen">
              <NotificationToggle
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
              <ProfileNavRow
                icon="user"
                label="Persönliche Daten bearbeiten"
                onPress={() => {
                  Alert.alert("Profil", "Bearbeiten ist hier noch nicht verfügbar.")
                }}
              />
              <ProfileNavRow
                icon="logout"
                label="Abmelden"
                danger
                onPress={() => {
                  Alert.alert("Abmelden", "Sie sind in dieser Demo nicht angemeldet.")
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

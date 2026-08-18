import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import {
  LocaleSetting,
  ProfileHeader,
  ThemeModeSetting
} from "@/components/profile-sections"
import { QueryState } from "@/components/query-state"
import { azdLayout } from "@/theme/azd-tokens"
import { usePatientProfile } from "@app-zum-doc/utils/hooks"
import { Card, ListActionItem, ListItem, ListNavigationItem, Switch, ThemedIcon, ThemedText } from "@helpwave/hightide-native/components"
import { useRouter } from "expo-router"
import { Building2, LogOut, UserIcon } from "lucide-react-native"
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

            <ThemedText style={{...theme.typography.body.md, fontSize: theme.typography.fontWeights.semibold}}>
              {t("personalData")}
            </ThemedText>
            <Card>
              <ListItem 
                title={profileQuery.data.fullName}
                subtitle={t("name")} 
              />
                <ListItem
                subtitle={t("dateOfBirth")}
                title={profileQuery.data.dateOfBirth}
              />
              <ListItem subtitle={t("email")} title={profileQuery.data.email} />
              <ListItem subtitle={t("phone")} title={profileQuery.data.phone} />
            </Card>

            <ThemedText style={{...theme.typography.body.md, fontSize: theme.typography.fontWeights.semibold}}>
              {t("practiceSection")}
            </ThemedText>
            <Card>
              <ListItem 
                title={profileQuery.data.practiceName}
                subtitle={t("practice")} 
              />
              <ListItem
                title={profileQuery.data.practiceAddress}
                subtitle={t("address")}
              />
              <ListNavigationItem 
                title={profileQuery.data.email}
                subtitle={t("practiceDetails")}
                onPress={() => {
                  router.push({
                    pathname: "/doctor/[id]",
                    params: { id: "office-moser" },
                  })
                }}
                leading={<ThemedIcon icon={Building2}/>}
              />
            </Card>

            <ThemedText style={{...theme.typography.body.md, fontSize: theme.typography.fontWeights.semibold}}>
              {t("settingsSection")}
            </ThemedText>
            <Card>
              <ListActionItem 
                title={profileQuery.data.practiceName}
                subtitle={t("notifications")}
                onPress={() => setNotificationsEnabled(prev => !prev)}
                trailing={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                }
              />
              <ThemeModeSetting />
              <LocaleSetting />
              <ListNavigationItem 
                title={t("editPersonalData")}
                leading={<ThemedIcon icon={UserIcon}/>}
                onPress={() => {
                  // TODO replace this
                  Alert.alert(t("tabProfile"), "Bearbeiten ist hier noch nicht verfügbar.")
                }}
              />
              <ListNavigationItem 
                title={t("signOut")}
                leading={<ThemedIcon icon={LogOut}/>}
                color={theme.colors.negative}
                onPress={() => {
                  // TODO replace this
                  Alert.alert(t("tabProfile"), "Bearbeiten ist hier noch nicht verfügbar.")
                }}
              />
            </Card>
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

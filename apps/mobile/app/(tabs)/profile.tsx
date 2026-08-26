import {
  LocaleSetting,
  ProfileHeader,
  ThemeModeSetting
} from "@/components/profile-sections"
import { QueryState } from "@/components/query-state"
import { Section } from "@/components/section"
import { useAppNotificationPermission } from "@/hooks/useAppNotificationPermission"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { formatPatientDateOfBirth, patientProfileFullName, toAppLocale } from "@app-zum-doc/utils/api"
import { usePatientProfile } from "@app-zum-doc/utils/hooks"
import { Button, Card, ListActionItem, ListItem, ListNavigationItem, Switch, ThemedIcon } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useRouter, type Href } from "expo-router"
import { Bell, ChevronRight, LogOut, Pill, Scale, Shield } from "lucide-react-native"
import { Alert, Linking, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTranslation } from "../../hooks/useAppTranslation"

export default function ProfileScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const profileQuery = usePatientProfile()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { notificationsEnabled, setNotificationsEnabled } = useAppNotificationPermission()

  return (
    <View
      style={[
        { 
          paddingTop: insets.top,
          backgroundColor: colors.background,
          flex: 1,
        },
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
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
              gap: theme.spacing.lg
            }}
            showsVerticalScrollIndicator={false}
          >
            <ProfileHeader profile={profileQuery.data} />
            
            <Section
              title={t("personalData")}
              trailing={
                <Button
                  accessibilityRole="button"
                  onPress={() => {
                    router.push("/personal-information" as Href)
                  }}
                  size="xs"
                  color={{color: theme.colors.surface.onColor, onColor: theme.colors.surface.color}}
                  trailingIcon={ChevronRight}
                  variant="foreground"
                >
                  {t("edit")}
                </Button>
              }
            >
              <Card>
                <ListItem 
                  title={patientProfileFullName(profileQuery.data)}
                  subtitle={t("name")} 
                />
                <ListItem
                  subtitle={t("dateOfBirth")}
                  title={formatPatientDateOfBirth(profileQuery.data.dateOfBirth, locale)}
                />
                <ListItem subtitle={t("email")} title={profileQuery.data.email} />
                <ListItem subtitle={t("phone")} title={profileQuery.data.phone} />
                <ListNavigationItem
                  title={t("medicationList")}
                  leading={<ThemedIcon icon={Pill}/>}
                  onPress={() => {
                    router.push("/medications" as Href)
                  }}
                />
                <ListNavigationItem 
                  title={t("signOut")}
                  leading={<ThemedIcon icon={LogOut}/>}
                  color={theme.colors.negative}
                  onPress={() => {
                    Alert.alert(t("tabProfile"), t("placeholderComingSoon"))
                  }}
                />
              </Card>
            </Section>
            
            <Section title={t("settingsSection")}>
              <Card>
                <ListActionItem 
                  title={t("notifications")}
                  onPress={() => {
                    setNotificationsEnabled(!notificationsEnabled)
                  }}
                  leading={<ThemedIcon icon={Bell}/>}
                  trailing={
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={(value) => {
                        setNotificationsEnabled(value)
                      }}
                    />
                  }
                />
                <ThemeModeSetting />
                <LocaleSetting />
              </Card>
            </Section>

            <Section title={t("privacyAndInformation")}>
              <Card>
                <ListNavigationItem
                  title={t("imprint")}
                  leading={<ThemedIcon icon={Scale}/>}
                  onPress={() => {
                    void Linking.openURL("https://www.helpwave.de/imprint")
                  }}
                />
                <ListNavigationItem
                  title={t("privacyPolicy")}
                  leading={<ThemedIcon icon={Shield}/>}
                  onPress={() => {
                    void Linking.openURL("https://www.helpwave.de/privacy")
                  }}
                />
              </Card>
            </Section>
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}

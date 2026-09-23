import {
  LocaleSetting,
  ProfileUserCarousel,
  ThemeModeSetting
} from "@/components/profile-sections"
import { QueryState } from "@/components/query-state"
import { Section } from "@/components/section"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toPatientProfileSummary } from "@app-zum-doc/utils/api"
import {
  usePatientProfile,
  usePatientProfiles,
  useSelectPatientProfile,
} from "@app-zum-doc/utils/hooks"
import { Button, Card, ListItem, ListNavigationItem, ThemedIcon } from "@helpwave/hightide-native/components"
import { useRouter, type Href } from "expo-router"
import { Scale, Shield, Users } from "lucide-react-native"
import { useMemo } from "react"
import { Linking, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTranslation } from "../../hooks/useAppTranslation"

export default function ProfileScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const profileQuery = usePatientProfile()
  const profilesQuery = usePatientProfiles()
  const selectProfile = useSelectPatientProfile()

  const profiles = useMemo(() => {
    if (profilesQuery.data != null && profilesQuery.data.length > 0) {
      return profilesQuery.data
    }
    if (profileQuery.data != null) {
      return [toPatientProfileSummary(profileQuery.data)]
    }
    return []
  }, [profileQuery.data, profilesQuery.data])

  const selectedProfileId = profileQuery.data?.id ?? profiles[0]?.id ?? ""

  return (
    <View
      style={[
        { 
          backgroundColor: theme.colors.background.color,
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
          void profilesQuery.refetch()
        }}
        loadingLabel={t("loadingProfile")}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: theme.spacing.lg,
            gap: theme.spacing.lg
          }}
          showsVerticalScrollIndicator={false}
        >
          {profiles.length > 0 ? (
            <ProfileUserCarousel
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              onSelectProfile={(profileId) => {
                if (profileId === selectedProfileId) {
                  return Promise.resolve()
                }
                return selectProfile.mutateAsync({ profileId }).then(() => undefined)
              }}
              onEdit={() => {
                router.push("/personal-information" as Href)
              }}
              onMedications={() => {
                router.push("/medications" as Href)
              }}
            />
          ) : (
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <Card>
                <ListItem
                  title={t("noProfileTitle")}
                  subtitle={t("noProfileDescription")}
                />
                <View style={{ padding: theme.spacing.md, alignItems: "flex-start" }}>
                  <Button
                    onPress={() => {
                      router.push("/migration" as Href)
                    }}
                  >
                    {t("loadFromBackup")}
                  </Button>
                </View>
              </Card>
            </View>
          )}

          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              gap: theme.spacing.lg,
            }}
          >
            <Section title={t("profiles")}>
              <Card>
                <ListNavigationItem
                  title={t("manageProfiles")}
                  leading={<ThemedIcon icon={Users}/>}
                  onPress={() => {
                    router.push("/manage-profiles" as Href)
                  }}
                />
              </Card>
            </Section>

            <Section title={t("settingsSection")}>
              <Card>
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
          </View>
        </ScrollView>
      </QueryState>
    </View>
  )
}

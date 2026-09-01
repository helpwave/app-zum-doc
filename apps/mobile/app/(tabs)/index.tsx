import { RequestTile, StartDoctorCard, StartHero } from "@/components/home-sections"
import { QueryState } from "@/components/query-state"
import { hrefForRequest } from "@/lib/request-routes"
import { homeQuickActions } from "@/lib/quick-actions"
import { Section } from "@/components/section"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toAppLocale } from "@app-zum-doc/utils/api"
import { useHomeSummary } from "@app-zum-doc/utils/hooks"
import { Button } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useRouter, type Href } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ChevronRight } from "lucide-react-native"
import { ScrollView, View } from "react-native"
import { useIsFocused } from "@react-navigation/native"

function ShowAllButton({ onPress }: { onPress: () => void }) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()

  return (
    <Button
      accessibilityRole="button"
      onPress={onPress}
      size="xs"
      color={{ color: theme.colors.surface.onColor, onColor: theme.colors.surface.color }}
      trailingIcon={ChevronRight}
      variant="foreground"
    >
      {t("showAll")}
    </Button>
  )
}

export default function HomeScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const homeQuery = useHomeSummary({ locale })
  const isFocused = useIsFocused()
  const sectionTitleStyle = {
    ...theme.typography.heading.sm,
    fontWeight: theme.fontWeights.bold,
    color: colors.sectionTitle,
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
      }}
    >
      {isFocused ? <StatusBar style="light" /> : null}
      <QueryState
        isPending={homeQuery.isPending}
        isError={homeQuery.isError}
        error={homeQuery.error}
        onRetry={() => {
          void homeQuery.refetch()
        }}
        loadingLabel={t("loadingHome")}
        style={{ backgroundColor: colors.screenBackground }}
      >
        {homeQuery.data ? (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: theme.spacing.xxl + theme.spacing.md,
            }}
            showsVerticalScrollIndicator={false}
          >
            <StartHero
              onSearchPress={() => {
                router.push("/doctor-search" as Href)
              }}
              onQuickActionPress={(actionId) => {
                const action = homeQuickActions.find((item) => item.id === actionId)
                if (action) {
                  router.push(action.href as Href)
                }
              }}
            />

            <View
              style={{
                paddingTop: theme.spacing.xl,
                gap: theme.spacing.xxl,
                paddingHorizontal: theme.spacing.lg,
              }}
            >
              <Section
                title={t("myDoctors")}
                titleStyle={sectionTitleStyle}
                trailing={(
                  <ShowAllButton
                    onPress={() => {
                      router.push("/doctors")
                    }}
                  />
                )}
              >
                <View style={{ marginHorizontal: -theme.spacing.lg, marginVertical: -theme.spacing.lg }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.lg,
                      gap: theme.spacing.md + theme.spacing.sm,
                    }}
                  >
                    {homeQuery.data.myDoctors.map((doctor) => (
                      <StartDoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onPress={() => {
                          router.push({
                            pathname: "/doctor/[id]",
                            params: { id: doctor.id },
                          })
                        }}
                      />
                    ))}
                  </ScrollView>
                </View>
              </Section>

              <Section
                title={t("recentRequests")}
                titleStyle={sectionTitleStyle}
                trailing={(
                  <ShowAllButton
                    onPress={() => {
                      router.push("/requests")
                    }}
                  />
                )}
              >
                <View style={{ gap: theme.spacing.md + theme.spacing.xs }}>
                  {homeQuery.data.recentRequests.map((request) => (
                    <RequestTile
                      key={request.id}
                      request={request}
                      onPress={() => {
                        router.push(hrefForRequest(request))
                      }}
                    />
                  ))}
                </View>
              </Section>
            </View>
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}

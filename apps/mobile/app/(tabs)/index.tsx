import {
  RequestEmptyCard,
  RequestPlaceholderCard,
  RequestTile,
  StartDoctorCard,
  StartDoctorEmptyCard,
  StartDoctorPlaceholderCard,
  StartHero,
} from "@/components/home-sections"
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
import { ChevronRight } from "lucide-react-native"
import { ScrollView, View } from "react-native"

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
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const homeQuery = useHomeSummary({ parameters: { locale }})

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <QueryState
        isPending={false}
        isError={homeQuery.isError}
        error={homeQuery.error}
        onRetry={() => {
          void homeQuery.refetch()
        }}
        loadingLabel={t("loadingHome")}
      >
        {homeQuery.isError ? null : (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: theme.spacing.lg,
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
                paddingTop: theme.spacing.lg,
                gap: theme.spacing.xxl,
                paddingHorizontal: theme.spacing.lg,
              }}
            >
              <Section
                title={t("myDoctors")}
                trailing={(
                  <ShowAllButton
                    onPress={() => {
                      router.push("/doctors")
                    }}
                  />
                )}
              >
                {!homeQuery.isPending && (homeQuery.data?.myDoctors.length ?? 0) === 0 ? (
                  <StartDoctorEmptyCard />
                ) : (
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
                      {homeQuery.isPending ? (
                        <StartDoctorPlaceholderCard />
                      ) : homeQuery.data?.myDoctors.map((doctor) => (
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
                )}
              </Section>

              <Section
                title={t("recentRequests")}
                trailing={(
                  <ShowAllButton
                    onPress={() => {
                      router.push("/requests")
                    }}
                  />
                )}
              >
                <View style={{ gap: theme.spacing.md + theme.spacing.xs }}>
                  {homeQuery.isPending ? (
                    <RequestPlaceholderCard />
                  ) : (homeQuery.data?.recentRequests.length ?? 0) === 0 ? (
                    <RequestEmptyCard />
                  ) : homeQuery.data?.recentRequests.map((request) => (
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
        )}
      </QueryState>
    </View>
  )
}

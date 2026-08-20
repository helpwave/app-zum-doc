import {
  MyDoctorsSection,
  RecentRequestsSection,
  StartHero,
} from "@/components/home-sections"
import { QueryState } from "@/components/query-state"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toAppLocale } from "@app-zum-doc/utils/api"
import { useHomeSummary } from "@app-zum-doc/utils/hooks"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useRouter, type Href } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ScrollView, View } from "react-native"
import { useAppTranslation } from "../../hooks/useAppTranslation"

export default function HomeScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const homeQuery = useHomeSummary(locale)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
      }}
    >
      <StatusBar style="light" />
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
              quickActions={homeQuery.data.quickActions}
              onSearchPress={() => {
                router.push("/doctor-search" as Href)
              }}
              onQuickActionPress={(action) => {
                router.push(action.href as Href)
              }}
            />

            <View
              style={{
                paddingTop: theme.spacing.xl,
                gap: theme.spacing.xxl,
              }}
            >
              <MyDoctorsSection
                doctors={homeQuery.data.myDoctors}
                onShowAll={() => {
                  router.push("/doctors")
                }}
                onDoctorPress={(doctorId) => {
                  router.push({
                    pathname: "/doctor/[id]",
                    params: { id: doctorId },
                  })
                }}
              />

              <RecentRequestsSection
                requests={homeQuery.data.recentRequests}
                onShowAll={() => {
                  router.push("/requests")
                }}
                onRequestPress={(requestId) => {
                  router.push({
                    pathname: "/requests/[id]",
                    params: { id: requestId },
                  })
                }}
              />
            </View>
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}

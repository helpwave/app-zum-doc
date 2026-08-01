import {
  MyDoctorsSection,
  RecentRequestsSection,
  StartHero,
} from "@/components/home-sections"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "../hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import { azdLayout } from "@/theme/azd-tokens"
import { useHomeSummary } from "@app-zum-doc/utils/hooks"
import { useRouter, type Href } from "expo-router"
import { ScrollView, StyleSheet, View } from "react-native"

export default function HomeScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.homeSections
  const router = useRouter()
  const homeQuery = useHomeSummary()

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.screenBackground },
      ]}
    >
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
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <StartHero
              quickActions={homeQuery.data.quickActions}
              onSearchPress={() => {
                router.push("/search")
              }}
              onQuickActionPress={(action) => {
                router.push(action.href as Href)
              }}
            />

            <View style={styles.body}>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: azdLayout.space[8],
  },
  body: {
    paddingTop: azdLayout.space[6],
    gap: azdLayout.space[7],
  },
})

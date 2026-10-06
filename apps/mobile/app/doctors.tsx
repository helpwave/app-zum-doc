import { AppBar } from "@/components/app-bar"
import { DoctorCard } from "@/components/doctor-card"
import { QueryState } from "@/components/query-state"
import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toAppLocale } from "@app-zum-doc/utils/api"
import { useHomeSummary } from "@app-zum-doc/utils/hooks"
import { ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useRouter } from "expo-router"
import { View } from "react-native"

export default function MyDoctorsScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const homeQuery = useHomeSummary({ parameters: { locale } })
  const doctors = homeQuery.data?.myDoctors ?? []

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar title={t("myDoctors")} />
      <QueryState
        isPending={homeQuery.isPending}
        isError={homeQuery.isError}
        error={homeQuery.error}
        onRetry={() => {
          void homeQuery.refetch()
        }}
        loadingLabel={t("loadingMyDoctors")}
        style={{ flex: 1 }}
      >
        {doctors.length === 0 ? (
          <ThemedText
            appearance="description"
            style={{
              ...theme.typography.body.md,
              textAlign: "center",
              paddingTop: theme.spacing.xl,
              paddingHorizontal: theme.spacing.lg,
            }}
          >
            {t("noMyDoctors")}
          </ThemedText>
        ) : (
          <VirtualList
            data={doctors}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{
              gap: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.lg,
              alignItems: "stretch",
              justifyContent: "flex-start",
            }}
            renderItem={({ item }) => (
              <DoctorCard
                doctor={item}
                onPress={() => {
                  router.push({
                    pathname: "/doctor/[id]",
                    params: { id: item.id },
                  })
                }}
              />
            )}
          />
        )}
      </QueryState>
    </View>
  )
}

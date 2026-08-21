import { RequestTile } from "@/components/home-sections"
import { NavigationHeader } from "@/components/navigation-header"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { hrefForRequest } from "@/lib/request-routes"
import { toAppLocale, type RequestKind } from "@app-zum-doc/utils/api"
import { useDoctorsOffice, useHomeSummary } from "@app-zum-doc/utils/hooks"
import { ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { ScrollView, View } from "react-native"

const requestTypeFilters: RequestKind[] = [
  "appointment",
  "prescription",
  "referral",
]

function RequestTypeChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  const { theme } = useAzdTheme()

  return (
    <ThemedPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      color={selected ? theme.colors.primary : theme.colors.surface}
      coloringStyle="filled"
      size="sm"
      stateLayerStyle={{
        borderRadius: 9999,
      }}
      style={{
        borderRadius: 9999,
        paddingLeft: theme.padding.xl,
        paddingRight: theme.padding.xl,
      }}
    >
      <ThemedText>{label}</ThemedText>
    </ThemedPressable>
  )
}

export default function RequestsScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { doctorId: doctorIdParam } = useLocalSearchParams<{
    doctorId?: string | string[]
  }>()
  const doctorId = typeof doctorIdParam === "string" ? doctorIdParam : ""
  const homeQuery = useHomeSummary(locale)
  const doctorQuery = useDoctorsOffice(doctorId, locale)
  const [selectedKind, setSelectedKind] = useState<RequestKind | null>(null)

  const typeLabels: Record<RequestKind, string> = {
    appointment: t("filterAppointments"),
    prescription: t("filterPrescriptions"),
    referral: t("filterReferrals"),
  }

  const requests = useMemo(() => {
    const allRequests = homeQuery.data?.recentRequests ?? []
    const byDoctor = doctorId
      ? allRequests.filter((request) => request.doctorsOfficeId === doctorId)
      : allRequests
    if (!selectedKind) {
      return byDoctor
    }
    return byDoctor.filter((request) => request.kind === selectedKind)
  }, [doctorId, homeQuery.data?.recentRequests, selectedKind])

  const title = doctorId
    ? doctorQuery.data?.name
      ?? homeQuery.data?.myDoctors.find((doctor) => doctor.id === doctorId)?.name
      ?? requests[0]?.doctorName
      ?? ""
    : t("allRequests")

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <NavigationHeader
        title={title}
        onBack={() => {
          router.back()
        }}
      />
      <QueryState
        isPending={homeQuery.isPending}
        isError={homeQuery.isError}
        error={homeQuery.error}
        onRetry={() => {
          void homeQuery.refetch()
        }}
        loadingLabel={t("loadingRequests")}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.md,
            }}
          >
            {requestTypeFilters.map((kind) => (
              <RequestTypeChip
                key={kind}
                label={typeLabels[kind]}
                selected={selectedKind === kind}
                onPress={() => {
                  setSelectedKind((current) => (current === kind ? null : kind))
                }}
              />
            ))}
          </View>
          {requests.length === 0 ? (
            <ThemedText
              style={{
                ...theme.typography.body.md,
                textAlign: "center",
              }}
              appearance="description"
            >
              {t("noSearchResults")}
            </ThemedText>
          ) : (
            <View style={{ gap: theme.spacing.md + theme.spacing.xs }}>
              {requests.map((request) => (
                <RequestTile
                  key={request.id}
                  request={request}
                  onPress={() => {
                    router.push(hrefForRequest(request))
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </QueryState>
    </View>
  )
}

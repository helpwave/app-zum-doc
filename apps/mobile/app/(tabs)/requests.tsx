import { AppBar } from "@/components/app-bar"
import { RequestTile } from "@/components/home-sections"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { hrefForRequest } from "@/lib/request-routes"
import { PatientRequestTypeUtils, toAppLocale, type PatientRequestType } from "@app-zum-doc/utils/api"
import { useDoctorsOffice, useHomeSummary } from "@app-zum-doc/utils/hooks"
import { ThemedPressable, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { ScrollView, View } from "react-native"

function RequestTypeChip({
  label,
  selected,
  type,
  onPress,
}: {
  label: string
  selected: boolean,
  type: PatientRequestType,
  onPress: () => void
}) {
  const { theme } = useAzdTheme()

  return (
    <ThemedPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      color={selected ? theme.colors[type] : theme.colors.surface}
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
  const doctorId = typeof doctorIdParam === "string" ? doctorIdParam : null
  const homeQuery = useHomeSummary({ locale })
  const doctorQuery = useDoctorsOffice({
    doctorsOfficeId: doctorId,
    locale,
    enabled: doctorId != null,
  })
  const [selectedRequestType, setSelectedRequestType] = useState<PatientRequestType | null>(null)

  const typeLabels: Record<PatientRequestType, string> = {
    appointment: t("filterAppointments"),
    prescription: t("filterPrescriptions"),
    referral: t("filterReferrals"),
  }

  const requests = useMemo(() => {
    const allRequests = homeQuery.data?.recentRequests ?? []
    const byDoctor = doctorId
      ? allRequests.filter((request) => request.doctorsOffice.id === doctorId)
      : allRequests
    if (!selectedRequestType) {
      return byDoctor
    }
    return byDoctor.filter((request) => request.kind === selectedRequestType)
  }, [doctorId, homeQuery.data?.recentRequests, selectedRequestType])

  const title = doctorId
    ? doctorQuery.data?.name
      ?? homeQuery.data?.myDoctors.find((doctor) => doctor.id === doctorId)?.name
      ?? requests[0]?.doctorsOffice.name
      ?? ""
    : t("allRequests")

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <AppBar
        title={title}
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
            {PatientRequestTypeUtils.array.map((type) => (
              <RequestTypeChip
                key={type}
                label={typeLabels[type]}
                type={type}
                selected={selectedRequestType === type}
                onPress={() => {
                  setSelectedRequestType((current) => (current === type ? null : type))
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

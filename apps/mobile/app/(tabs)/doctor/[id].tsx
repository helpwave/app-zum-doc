import {
  DoctorDetailHero,
  DoctorOfficeContactSections,
  DoctorRequestsSection,
  OpeningHoursSection,
} from "@/components/doctor-detail-sections"
import { QueryState } from "@/components/query-state"
import { hrefForRequest } from "@/lib/request-routes"
import { Snackbar } from "@/components/snackbar"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toAppLocale } from "@app-zum-doc/utils/api"
import { useAddMyDoctor, useDoctorsOffice, useHomeSummary, useRemoveMyDoctor } from "@app-zum-doc/utils/hooks"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, ScrollView, View } from "react-native"

export default function DoctorDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const { id } = useLocalSearchParams<{ id: string }>()
  const doctorsOfficeId = typeof id === "string" ? id : ""
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const router = useRouter()
  const officeQuery = useDoctorsOffice(doctorsOfficeId, locale)
  const homeQuery = useHomeSummary(locale)
  const addMyDoctor = useAddMyDoctor()
  const removeMyDoctor = useRemoveMyDoctor()
  const office = officeQuery.data
  const doctorRequests = (homeQuery.data?.recentRequests ?? []).filter(
    (request) => request.doctorsOfficeId === doctorsOfficeId,
  )
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const dismissSnackbar = useCallback(() => {
    setSnackbarMessage(null)
  }, [])

  return (
    <View
      style={[
        { flex: 1 },
      ]}
    >
      <QueryState
        isPending={officeQuery.isPending}
        isError={officeQuery.isError}
        error={officeQuery.error}
        onRetry={() => {
          officeQuery.refetch()
        }}
        loadingLabel={t("loadingDoctor")}
        style={{ backgroundColor: colors.screenBackground }}
      >
        {office ? (
          <ScrollView
            contentContainerStyle={[
              { flexGrow: 1 },
              { paddingBottom: theme.spacing.xl },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <DoctorDetailHero
              office={office}
              isAddingDoctor={addMyDoctor.isPending}
              isRemovingDoctor={removeMyDoctor.isPending}
              onRemoveDoctor={() => {
                if (removeMyDoctor.isPending) {
                  return
                }
                removeMyDoctor.mutate({ doctorsOfficeId: office.id, locale }, {
                  onError: () => {
                    setSnackbarMessage(t("errorTitle"))
                  },
                })
              }}
              onAddDoctor={() => {
                if (addMyDoctor.isPending) {
                  return
                }
                addMyDoctor.mutate({ doctorsOfficeId: office.id, locale }, {
                  onError: () => {
                    setSnackbarMessage(t("errorTitle"))
                  },
                })
              }}
              onQuickActionPress={(action) => {
                if (action.id === "appointment") {
                  router.push({
                    pathname: "/requests/appointment/create",
                    params: { doctorId: office.id },
                  } as Href)
                  return
                }
                if (action.id === "prescription") {
                  router.push({
                    pathname: "/requests/prescription/create",
                    params: { doctorId: office.id },
                  } as Href)
                  return
                }
                if (action.id === "referral") {
                  router.push({
                    pathname: "/requests/referral/create",
                    params: { doctorId: office.id },
                  } as Href)
                  return
                }
                router.push(action.href as Href)
              }}
            />

            <View
              style={{
                padding: theme.spacing.lg,
                gap: theme.spacing.lg,
              }}
            >
              {office.isMyDoctor && doctorRequests.length > 0 ? (
                <DoctorRequestsSection
                  requests={doctorRequests.slice(0, 3)}
                  onShowAll={() => {
                    router.push({
                      pathname: "/requests",
                      params: { doctorId: office.id },
                    })
                  }}
                  onRequestPress={(requestId) => {
                    const request = doctorRequests.find((item) => item.id === requestId)
                    if (!request) {
                      return
                    }
                    router.push(hrefForRequest(request))
                  }}
                />
              ) : null}
              <OpeningHoursSection openingHours={office.openingHours} />
              <DoctorOfficeContactSections
                office={office}
                onServicesPress={() => {
                  Alert.alert(t("ourServices"), t("servicesSoon"))
                }}
                onOffersPress={() => {
                  Alert.alert(t("furtherOffers"), t("offersSoon"))
                }}
              />
            </View>
          </ScrollView>
        ) : null}
      </QueryState>
      <Snackbar message={snackbarMessage} onDismiss={dismissSnackbar} />
    </View>
  )
}

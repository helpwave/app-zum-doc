import {
  DoctorDetailHero,
  DoctorOfficeContactSections,
  DoctorRequestsSection,
  OpeningHoursSection,
} from "@/components/doctor-detail-sections"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { QueryState } from "@/components/query-state"
import { hrefForRequest } from "@/lib/request-routes"
import { Snackbar } from "@/components/snackbar"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { isMyDoctorsOffice, toAppLocale } from "@app-zum-doc/utils/api"
import { useAddMyDoctor, useDoctorsOffice, useHomeSummary, useMyDoctors, useRemoveMyDoctor } from "@app-zum-doc/utils/hooks"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, View } from "react-native"

export default function DoctorDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const doctorsOfficeId = typeof id === "string" ? id : null
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const router = useRouter()
  const officeQuery = useDoctorsOffice({
    parameters: doctorsOfficeId === null ? undefined : {
      id: doctorsOfficeId,
      locale,
    }
  })
  const myDoctorsQuery = useMyDoctors()
  const homeQuery = useHomeSummary({ parameters: { locale } })
  const addMyDoctor = useAddMyDoctor()
  const removeMyDoctor = useRemoveMyDoctor()
  const office = officeQuery.data
  const isMyDoctor =
    myDoctorsQuery.data && doctorsOfficeId != null
      ? isMyDoctorsOffice(myDoctorsQuery.data, doctorsOfficeId)
      : false
  const doctorRequests = (homeQuery.data?.recentRequests ?? []).filter(
    (request) => request.doctorsOffice.id === doctorsOfficeId,
  )
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const [infoModal, setInfoModal] = useState<{ title: string, message: string } | null>(null)
  const dismissSnackbar = useCallback(() => {
    setSnackbarMessage(null)
  }, [])

  return (
    <View
      style={[
        { 
          flex: 1,
          backgroundColor: theme.colors.background.color
        },
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
              isMyDoctor={isMyDoctor}
              isAddingDoctor={addMyDoctor.isPending}
              isRemovingDoctor={removeMyDoctor.isPending}
              onRemoveDoctor={() => {
                removeMyDoctor.mutate({ doctorsOfficeId: office.id }, {
                  onError: () => {
                    setSnackbarMessage(t("errorTitle"))
                  },
                })
              }}
              onAddDoctor={() => {
                addMyDoctor.mutate({ doctorsOfficeId: office.id }, {
                  onError: () => {
                    setSnackbarMessage(t("errorTitle"))
                  },
                })
              }}
              onQuickActionPress={(actionId) => {
                if (actionId === "appointment") {
                  router.push({
                    pathname: "/requests/appointment/create",
                    params: { doctorId: office.id },
                  } as Href)
                  return
                }
                if (actionId === "prescription") {
                  router.push({
                    pathname: "/requests/prescription/create",
                    params: { doctorId: office.id },
                  } as Href)
                  return
                }
                if (actionId === "referral") {
                  router.push({
                    pathname: "/requests/referral/create",
                    params: { doctorId: office.id },
                  } as Href)
                }
              }}
            />

            <View
              style={{
                padding: theme.spacing.lg,
                gap: theme.spacing.lg,
              }}
            >
              {isMyDoctor && doctorRequests.length > 0 ? (
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
                  setInfoModal({
                    title: t("ourServices"),
                    message: t("servicesSoon"),
                  })
                }}
                onOffersPress={() => {
                  setInfoModal({
                    title: t("furtherOffers"),
                    message: t("offersSoon"),
                  })
                }}
              />
            </View>
          </ScrollView>
        ) : null}
      </QueryState>
      <Snackbar message={snackbarMessage} onDismiss={dismissSnackbar} />
      <ConfirmationModal
        isOpen={infoModal != null}
        onIsOpenChange={(isOpen) => {
          if (!isOpen) {
            setInfoModal(null)
          }
        }}
        title={infoModal?.title ?? ""}
        message={infoModal?.message ?? ""}
      />
    </View>
  )
}

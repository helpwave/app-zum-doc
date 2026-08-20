import {
    DoctorDetailHero,
    DoctorOfficeContactSections,
    OpeningHoursSection,
} from "@/components/doctor-detail-sections"
import { QueryState } from "@/components/query-state"
import { Snackbar } from "@/components/snackbar"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { useAddMyDoctor, useDoctorsOffice, useRemoveMyDoctor } from "@app-zum-doc/utils/hooks"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function DoctorDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const { id } = useLocalSearchParams<{ id: string }>()
  const doctorsOfficeId = typeof id === "string" ? id : ""
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const officeQuery = useDoctorsOffice(doctorsOfficeId)
  const addMyDoctor = useAddMyDoctor()
  const removeMyDoctor = useRemoveMyDoctor()
  const office = officeQuery.data
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const dismissSnackbar = useCallback(() => {
    setSnackbarMessage(null)
  }, [])

  return (
    <View
      style={[
        { flex: 1 },
        { backgroundColor: colors.screenBackground },
      ]}
    >
      <QueryState
        isPending={officeQuery.isPending}
        isError={officeQuery.isError}
        error={officeQuery.error}
        onRetry={() => {
          void officeQuery.refetch()
        }}
        loadingLabel={t("loadingDoctor")}
        style={{ backgroundColor: colors.screenBackground }}
      >
        {office ? (
          <ScrollView
            contentContainerStyle={[
              { flexGrow: 1 },
              { paddingBottom: insets.bottom + theme.spacing.xl },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <DoctorDetailHero
              office={office}
              isAddingDoctor={addMyDoctor.isPending}
              isRemovingDoctor={removeMyDoctor.isPending}
              onBack={() => router.back()}
              onRemoveDoctor={() => {
                if (removeMyDoctor.isPending) {
                  return
                }
                removeMyDoctor.mutate(office.id, {
                  onError: () => {
                    setSnackbarMessage(t("errorTitle"))
                  },
                })
              }}
              onAddDoctor={() => {
                if (addMyDoctor.isPending) {
                  return
                }
                addMyDoctor.mutate(office.id, {
                  onError: () => {
                    setSnackbarMessage(t("errorTitle"))
                  },
                })
              }}
              onQuickActionPress={(action) => {
                router.push(action.href as Href)
              }}
            />

            <View
              style={{
                padding: theme.spacing.lg,
                gap: theme.spacing.lg,
              }}
            >
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

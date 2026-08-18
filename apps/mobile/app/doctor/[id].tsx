import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import {
  DoctorDetailHero,
  OpeningHoursSection,
  openDoctorsOfficeNavigation,
  openDoctorsOfficePhone,
  openDoctorsOfficeWebsite
} from "@/components/doctor-detail-sections"
import { QueryState } from "@/components/query-state"
import { Section } from "@/components/section"
import { azdLayout } from "@/theme/azd-tokens"
import { useDoctorsOffice } from "@app-zum-doc/utils/hooks"
import { Card, ListNavigationItem } from "@helpwave/hightide-native/components"
import { useLocalSearchParams, useRouter } from "expo-router"
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
  const office = officeQuery.data

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
              { paddingBottom: insets.bottom + azdLayout.space[6] },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <DoctorDetailHero
              office={office}
              onBack={() => router.back()}
              onMore={() => {
                Alert.alert(t("moreOptions"), t("offersSoon"))
              }}
              onAddDoctor={() => {
                Alert.alert(t("addAsMyDoctor"), t("addDoctorSoon"))
              }}
              onCall={() => {
                openDoctorsOfficePhone(office.phone)
              }}
            />

            <View 
              style={{
                padding: theme.spacing.lg,
                gap: theme.spacing.lg,
              }}
            >
              <OpeningHoursSection openingHours={office.openingHours} />

              <Card>
                <ListNavigationItem
                  title={t("ourServices")}
                  onPress={() => {
                  Alert.alert(t("ourServices"), t("servicesSoon"))
                }}
                />
              </Card>

              <Section title={t("address")}>
                <Card>
                  <ListNavigationItem
                    title={`${office.addressLine1}\n${office.addressLine2}`}
                    onPress={() => {
                      openDoctorsOfficeNavigation(
                        office.addressLine1,
                        office.addressLine2,
                      )
                    }}
                  />
                </Card>
              </Section>
              
              <Section title={t("website")}>
                <Card>
                  <ListNavigationItem
                    title={office.websiteLabel}
                    onPress={() => {
                      openDoctorsOfficeWebsite(office.websiteUrl)
                    }}
                  />
                </Card>
              </Section>

              <Section title={t("furtherOffers")}>
                <Card>
                  <ListNavigationItem
                    title={office.additionalOfferLabel}
                    onPress={() => {
                      Alert.alert(t("furtherOffers"), t("offersSoon"))
                    }}
                  />
                </Card>
              </Section>
            </View>
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}
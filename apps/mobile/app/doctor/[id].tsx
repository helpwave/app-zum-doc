import { useAppTranslation } from "@/app/hooks/useAppTranslation"
import { useAzdTheme } from "@/app/hooks/useAzdTheme"
import {
  DoctorDetailHero,
  DoctorInfoRow,
  DoctorLabeledSection,
  OpeningHoursSection,
  openDoctorsOfficeNavigation,
  openDoctorsOfficePhone,
  openDoctorsOfficeWebsite,
} from "@/components/doctor-detail-sections"
import { QueryState } from "@/components/query-state"
import { azdLayout } from "@/theme/azd-tokens"
import { useDoctorsOffice } from "@app-zum-doc/utils/hooks"
import { Card, ListActionItem, ThemedText } from "@helpwave/hightide-native/components"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
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
        styles.screen,
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
              styles.content,
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

            <View style={styles.body}>
              <OpeningHoursSection openingHours={office.openingHours} />

              <DoctorInfoRow
                label={t("ourServices")}
                value={t("ourServices")}
                onPress={() => {
                  Alert.alert(t("ourServices"), t("servicesSoon"))
                }}
              />

              <ThemedText style={{...theme.typography.body.md, fontSize: theme.typography.fontWeights.semibold}}>
                {t("address")}
              </ThemedText>
              <Card>
                <ListActionItem
                  title={`${office.addressLine1}\n${office.addressLine2}`}
                  onPress={() => {
                    openDoctorsOfficeNavigation(
                      office.addressLine1,
                      office.addressLine2,
                    )
                  }}
                />
              </Card>

              <DoctorLabeledSection label={t("website")}>
                <DoctorInfoRow
                  label={t("website")}
                  value={office.websiteLabel}
                  onPress={() => {
                    openDoctorsOfficeWebsite(office.websiteUrl)
                  }}
                />
              </DoctorLabeledSection>

              <DoctorLabeledSection label={t("furtherOffers")}>
                <DoctorInfoRow
                  label={t("furtherOffers")}
                  value={office.additionalOfferLabel}
                  onPress={() => {
                    Alert.alert(t("furtherOffers"), t("offersSoon"))
                  }}
                />
              </DoctorLabeledSection>
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
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: azdLayout.space[4],
    paddingTop: azdLayout.space[6],
    gap: azdLayout.space[6],
  },
})

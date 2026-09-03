import { AppBar } from "@/components/app-bar"
import { PrescriptionMedicationCard } from "@/components/prescription-medication-card"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { patientProfileFullName, toAppLocale } from "@app-zum-doc/utils/api"
import { useCancelPrescription, usePatientProfileById, usePrescription } from "@app-zum-doc/utils/hooks"
import { OKLCHUtils } from "@helpwave/hightide-design/utils"
import {
  Button,
  Card,
  Chip,
  Divider,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { ContentThemeOverrideProvider, useLocalization } from "@helpwave/hightide-native/global-contexts"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { Clock, RotateCw } from "lucide-react-native"
import { useMemo } from "react"
import { Alert, ColorValue, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const doctorPortrait = require("../../../assets/images/doctor-portrait.png")
const practiceLogo = require("../../../assets/images/practice-logo.png")

export default function PrescriptionDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { id } = useLocalSearchParams<{ id: string }>()
  const prescriptionId = typeof id === "string" ? id : null
  const prescriptionQuery = usePrescription({ 
    parameters: prescriptionId === null ? undefined : { id: prescriptionId, locale }
  })
  const cancelPrescription = useCancelPrescription()
  const prescription = prescriptionQuery.data
  const profileQuery = usePatientProfileById({
    parameters: prescription?.profileId === undefined ? undefined : {
      profileId: prescription.profileId
    }
  })
  const doctorsOffice = prescription?.doctorsOffice
  const imageSource =
    doctorsOffice?.imageUri === "practice-logo"
      ? practiceLogo
      : doctorsOffice?.imageUri === "doctor-portrait"
        ? doctorPortrait
        : doctorsOffice?.imageUri
          ? { uri: doctorsOffice.imageUri }
          : doctorPortrait
  const patientName = profileQuery.data
    ? patientProfileFullName(profileQuery.data)
    : undefined

  const heroColors = useMemo(() => {
    const color = theme.colors.prescription.color
    const start = OKLCHUtils.changeLightness(color, 0.45)
    const end = OKLCHUtils.changeLightness(color, 0.6)
    const gradient: readonly [ColorValue, ColorValue, ...ColorValue[]] = [start, end]
    return gradient
  }, [theme.colors.prescription.color])
  

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.color }}>
      <QueryState
        isPending={prescriptionQuery.isPending}
        isError={prescriptionQuery.isError}
        error={prescriptionQuery.error}
        onRetry={() => {
          void prescriptionQuery.refetch()
        }}
        loadingLabel={t("loadingPrescription")}
      >
        {prescription ? (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: theme.spacing.xl + insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={heroColors}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppBar
                title={t("actionPrescription")}
                color={{color: "#FFFFFF00", onColor: theme.colors.prescription.onColor}}
              />
              <View 
                style={{
                  paddingHorizontal: theme.spacing.lg,
                  paddingBottom: theme.spacing.lg,
                }}
              >
                <Card
                  style={{
                    padding: theme.spacing.lg,
                    gap: theme.spacing.lg,
                    boxShadow: StyleAdapterUtils.shadow(theme.shadow.container),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: theme.spacing.md,
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={imageSource}
                      style={{
                        width: theme.semantics.container.md.size,
                        height: theme.semantics.container.md.size,
                        borderRadius: 9999,
                      }}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1, gap: theme.spacing.xs }}>
                      <ThemedText
                        style={{
                          ...theme.typography.heading.md,
                        }}
                      >
                        {doctorsOffice?.name}
                      </ThemedText>
                      <ThemedText
                        appearance="description"
                        style={{
                          ...theme.typography.body.sm,
                        }}
                      >
                        {doctorsOffice?.specialization}
                      </ThemedText>
                    </View>
                    <Chip
                      size="sm"
                      variant="tonal"
                      color={
                        prescription.status === "inProgress"
                          ? theme.colors.warning
                          : prescription.status === "cancelled"
                            ? theme.colors.negative
                            : theme.colors.positive
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: theme.spacing.xs,
                        }}
                      >
                        <ThemedIcon icon={Clock} size={theme.icongraphy.sizes.xs} />
                        <ThemedText>
                          {t("patientRequestStatus", { status: prescription.status })}
                        </ThemedText>
                      </View>
                    </Chip>
                  </View>
                </Card>
              </View>
            </LinearGradient>

            <View
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.lg,
                gap: theme.spacing.xl,
              }}
            >
              <View>
                <DetailRow label={t("patient")} value={patientName ?? "—"} />
                <Divider />
                <DetailRow
                  label={t("shipByMail")}
                  value={prescription.shipByMail ? t("yes") : t("no")}
                />
              </View>

              {prescription.note.trim().length > 0 ? (
                <View
                  style={{
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    gap: theme.spacing.sm,
                    backgroundColor: theme.semantics.coloringColorVariant({
                      colorPair: theme.colors.surface,
                      variant: "normal",
                    }).color,
                  }}
                >
                  <ContentThemeOverrideProvider 
                    foreground={theme.semantics.coloringColorVariant({
                      colorPair: theme.colors.surface,
                      variant: "normal",
                    }).onColor}
                  >
                    <ThemedText
                      appearance="description"
                      style={theme.typography.body.sm}
                    >
                      {t("appointmentNote")}
                    </ThemedText>
                    <ThemedText style={theme.typography.body.md}>
                      {prescription.note}
                    </ThemedText>
                  </ContentThemeOverrideProvider>
                </View>
              ) : null}

              <View style={{ gap: theme.spacing.md }}>
                <ThemedText
                  appearance="description"
                  style={{
                    ...theme.typography.body.md,
                    fontWeight: theme.fontWeights.bold,
                  }}
                >
                  {t("medicationsSection")}
                </ThemedText>
                {prescription.medications.map((medication) => (
                  <PrescriptionMedicationCard
                    key={medication.id}
                    name={medication.name}
                    size={medication.size}
                  />
                ))}
              </View>

              <View style={{ gap: theme.spacing.md, justifyContent: "flex-end", flexDirection: "row" }}>
                <Button
                  leadingIcon={RotateCw}
                  variant="tonal"
                  onPress={() => {
                    router.push({
                      pathname: "/requests/prescription/create",
                      params: {
                        doctorId: prescription.doctorsOffice.id,
                        reorderFrom: prescription.id,
                      },
                    } as Href)
                  }}
                >
                  {t("orderAgain")}
                </Button>
                {prescription.status !== "cancelled" ? (
                  <Button
                    color={theme.colors.negative}
                    variant="tonal"
                    disabled={cancelPrescription.isPending}
                    onPress={() => {
                      Alert.alert(
                        t("cancelAppointmentRequest"),
                        t("cancelPrescriptionConfirm"),
                        [
                          { text: t("cancel"), style: "cancel" },
                          {
                            text: t("cancelAppointmentRequest"),
                            style: "destructive",
                            onPress: () => {
                              void cancelPrescription.mutateAsync({
                                prescriptionId: prescription.id,
                                locale,
                              })
                            },
                          },
                        ],
                      )
                    }}
                  >
                    {t("cancelAppointmentRequest")}
                  </Button>
                ) : null}
              </View>
            </View>
          </ScrollView>
        ) : null}
      </QueryState>
    </View>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  const { theme } = useAzdTheme()

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <ThemedText
        appearance="description"
        style={theme.typography.body.md}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={{
          ...theme.typography.body.md,
          fontWeight: theme.fontWeights.semibold,
          flexShrink: 1,
          textAlign: "right",
        }}
      >
        {value}
      </ThemedText>
    </View>
  )
}

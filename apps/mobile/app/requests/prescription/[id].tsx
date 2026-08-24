import { AppBar } from "@/components/app-bar"
import { PrescriptionMedicationCard } from "@/components/prescription-medication-card"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toAppLocale } from "@app-zum-doc/utils/api"
import { useCancelPrescription, usePrescription } from "@app-zum-doc/utils/hooks"
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { ContentThemeOverrideProvider, useLocalization } from "@helpwave/hightide-native/global-contexts"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { Clock, MessageCircle, RotateCw } from "lucide-react-native"
import { Alert, ScrollView, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const doctorPortrait = require("../../../assets/images/doctor-portrait.png")
const practiceLogo = require("../../../assets/images/practice-logo.png")

export default function PrescriptionDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { id } = useLocalSearchParams<{ id: string }>()
  const prescriptionId = typeof id === "string" ? id : ""
  const prescriptionQuery = usePrescription(prescriptionId, locale)
  const cancelPrescription = useCancelPrescription()
  const prescription = prescriptionQuery.data
  const imageSource =
    prescription?.doctorImageUri === "practice-logo"
      ? practiceLogo
      : prescription?.doctorImageUri === "doctor-portrait"
        ? doctorPortrait
        : prescription?.doctorImageUri
          ? { uri: prescription.doctorImageUri }
          : doctorPortrait

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      <QueryState
        isPending={prescriptionQuery.isPending}
        isError={prescriptionQuery.isError}
        error={prescriptionQuery.error}
        onRetry={() => {
          void prescriptionQuery.refetch()
        }}
        loadingLabel={t("loadingPrescription")}
        style={{ backgroundColor: colors.screenBackground }}
      >
        {prescription ? (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: theme.spacing.xl + insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={[colors.heroStart, colors.heroEnd]}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: insets.top + theme.spacing.md,
                paddingBottom: theme.spacing.lg,
              }}
            >
              <ContentThemeOverrideProvider foreground={colors.heroIcon}>
                <AppBar
                  title={t("actionPrescription")}
                  trailing={
                    <IconButton
                      icon={MessageCircle}
                      variant="foreground"
                      accessibilityLabel={t("openChat")}
                      onPress={() => {
                        Alert.alert(t("actionPrescription"), t("placeholderComingSoon"))
                      }}
                    />
                  }
                />
              </ContentThemeOverrideProvider>
            </LinearGradient>

            <View
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.lg,
                gap: theme.spacing.xl,
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
                    <Text
                      style={{
                        ...theme.typography.heading.md,
                        color: colors.name,
                      }}
                    >
                      {prescription.doctorName}
                    </Text>
                    <Text
                      style={{
                        ...theme.typography.body.sm,
                        color: colors.specialty,
                      }}
                    >
                      {prescription.doctorSpecialty}
                    </Text>
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

              <View>
                <DetailRow label={t("patient")} value={prescription.patientName} />
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
                        doctorId: prescription.doctorsOfficeId,
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
  const colors = theme.components.doctorDetail

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
      <Text
        style={{
          ...theme.typography.body.md,
          fontWeight: theme.fontWeights.semibold,
          color: colors.rowValue,
          flexShrink: 1,
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  )
}

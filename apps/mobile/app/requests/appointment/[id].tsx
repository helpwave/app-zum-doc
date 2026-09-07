import { AppBar } from "@/components/app-bar"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { parseIsoDate, formatPatientDateOfBirth, patientProfileFullName, toAppLocale } from "@app-zum-doc/utils/api"
import { useAppointment, useCancelAppointment, usePatientProfileById } from "@app-zum-doc/utils/hooks"
import {
  Button,
  Card,
  Chip,
  Divider,
  ThemedIcon,
  ThemedText,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { StyleAdapterUtils } from "@helpwave/hightide-native/theme"
import { OKLCHUtils } from "@helpwave/hightide-design/utils"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams } from "expo-router"
import { Calendar, Clock } from "lucide-react-native"
import { useMemo, useState } from "react"
import { ColorValue, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const doctorPortrait = require("../../../assets/images/doctor-portrait.png")
const practiceLogo = require("../../../assets/images/practice-logo.png")

export default function AppointmentDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { id } = useLocalSearchParams<{ id: string }>()
  const appointmentId = typeof id === "string" ? id : null
  const appointmentQuery = useAppointment({ 
    parameters: appointmentId === null ? undefined : { appointmentId, locale } 
  })
  const cancelAppointment = useCancelAppointment()
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const appointment = appointmentQuery.data
  const profileQuery = usePatientProfileById({
    parameters: appointment?.profileId === undefined ? undefined : {
      profileId: appointment?.profileId
    }
  })
  const doctorsOffice = appointment?.doctorsOffice
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
  const patientDateOfBirth = profileQuery.data
    ? formatPatientDateOfBirth(profileQuery.data.dateOfBirth, locale)
    : undefined

  const heroColors = useMemo(() => {
    const color = theme.colors.appointment.color
    const start = OKLCHUtils.changeLightness(color, 0.45)
    const end = OKLCHUtils.changeLightness(color, 0.6)
    const gradient: readonly [ColorValue, ColorValue, ...ColorValue[]] = [start, end]
    return gradient
  }, [theme.colors.appointment.color])

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.color }}>
      <QueryState
        isPending={appointmentQuery.isPending}
        isError={appointmentQuery.isError}
        error={appointmentQuery.error}
        onRetry={() => {
          void appointmentQuery.refetch()
        }}
        loadingLabel={t("loadingAppointment")}
      >
        {appointment ? (
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
                title={t("appointmentTitle")}
                color={{color: "#FFFFFF00", onColor: theme.colors.appointment.onColor}}
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
                        appointment.status === "requested"
                          ? theme.colors.warning
                          : appointment.status === "cancelled"
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
                          {t("patientRequestStatus", { status: appointment.status })}
                        </ThemedText>
                      </View>
                    </Chip>
                  </View>
                  <Divider />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: theme.spacing.md,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: theme.spacing.sm,
                        flex: 1,
                      }}
                    >
                      <ThemedIcon
                        icon={Calendar}
                        color={theme.colors.primary.color}
                      />
                      <ThemedText style={theme.typography.body.md}>
                        {formatLongDate(appointment.date, locale)}
                      </ThemedText>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: theme.spacing.sm,
                      }}
                    >
                      <ThemedIcon
                        icon={Clock}
                        color={theme.colors.primary.color}
                      />
                      <ThemedText style={theme.typography.body.md}>
                        {appointment.time}
                      </ThemedText>
                    </View>
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
                  label={t("dateOfBirth")}
                  value={patientDateOfBirth ?? "—"}
                />
                {appointment.sickNote ? (
                  <>
                    <Divider />
                    <DetailRow
                      label={t("sickNote")}
                      value={appointment.sickNote}
                    />
                  </>
                ) : null}
              </View>

              {appointment.status !== "cancelled" ? (
                <Button
                  color={theme.colors.negative}
                  variant="tonal"
                  isProcessing={cancelAppointment.isPending}
                  onPress={() => {
                    setCancelConfirmOpen(true)
                  }}
                  style={{ alignSelf: "flex-end" }}
                >
                  {t("cancelAppointmentRequest")}
                </Button>
              ) : null}
            </View>
          </ScrollView>
        ) : null}
      </QueryState>
      <ConfirmationModal
        isOpen={cancelConfirmOpen}
        onIsOpenChange={setCancelConfirmOpen}
        title={t("cancelAppointmentRequest")}
        message={t("cancelAppointmentConfirm")}
        cancelLabel={t("cancel")}
        confirmLabel={t("cancelAppointmentRequest")}
        confirmColor={theme.colors.negative}
        onConfirm={() => {
          if (!appointment) {
            return
          }
          void cancelAppointment.mutateAsync({
            appointmentId: appointment.id,
            locale,
          })
        }}
      />
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

function formatLongDate(isoDate: string, locale: string): string {
  return parseIsoDate(isoDate).toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

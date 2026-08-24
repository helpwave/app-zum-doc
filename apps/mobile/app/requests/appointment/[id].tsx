import { AppBar } from "@/components/app-bar"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { parseIsoDate, toAppLocale } from "@app-zum-doc/utils/api"
import { useAppointment, useCancelAppointment } from "@app-zum-doc/utils/hooks"
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
import { useLocalSearchParams } from "expo-router"
import { Calendar, Clock, MessageCircle } from "lucide-react-native"
import { Alert, ScrollView, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const doctorPortrait = require("../../../assets/images/doctor-portrait.png")
const practiceLogo = require("../../../assets/images/practice-logo.png")

export default function AppointmentDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const insets = useSafeAreaInsets()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { id } = useLocalSearchParams<{ id: string }>()
  const appointmentId = typeof id === "string" ? id : ""
  const appointmentQuery = useAppointment(appointmentId, locale)
  const cancelAppointment = useCancelAppointment()
  const appointment = appointmentQuery.data
  const imageSource =
    appointment?.doctorImageUri === "practice-logo"
      ? practiceLogo
      : appointment?.doctorImageUri === "doctor-portrait"
        ? doctorPortrait
        : appointment?.doctorImageUri
          ? { uri: appointment.doctorImageUri }
          : doctorPortrait

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      <QueryState
        isPending={appointmentQuery.isPending}
        isError={appointmentQuery.isError}
        error={appointmentQuery.error}
        onRetry={() => {
          void appointmentQuery.refetch()
        }}
        loadingLabel={t("loadingAppointment")}
        style={{ backgroundColor: colors.screenBackground }}
      >
        {appointment ? (
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
                  title={t("appointmentTitle")}
                  trailing={
                    <IconButton
                      icon={MessageCircle}
                      variant="foreground"
                      accessibilityLabel={t("openChat")}
                      onPress={() => {
                        Alert.alert(t("appointmentTitle"), t("placeholderComingSoon"))
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
                      {appointment.doctorName}
                    </Text>
                    <Text
                      style={{
                        ...theme.typography.body.sm,
                        color: colors.specialty,
                      }}
                    >
                      {appointment.doctorSpecialty}
                    </Text>
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

              <View>
                <DetailRow label={t("patient")} value={appointment.patientName} />
                <Divider />
                <DetailRow
                  label={t("dateOfBirth")}
                  value={appointment.patientDateOfBirth}
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
                  disabled={cancelAppointment.isPending}
                  onPress={() => {
                    Alert.alert(
                      t("cancelAppointmentRequest"),
                      t("cancelAppointmentConfirm"),
                      [
                        { text: t("cancel"), style: "cancel" },
                        {
                          text: t("cancelAppointmentRequest"),
                          style: "destructive",
                          onPress: () => {
                            void cancelAppointment.mutateAsync({
                              appointmentId: appointment.id,
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

function formatLongDate(isoDate: string, locale: string): string {
  return parseIsoDate(isoDate).toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

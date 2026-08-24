import { AppBar } from "@/components/app-bar"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { patientProfileFullName, toAppLocale } from "@app-zum-doc/utils/api"
import { useCancelReferral, usePatientProfileById, useReferral } from "@app-zum-doc/utils/hooks"
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

export default function ReferralDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.doctorDetail
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { id } = useLocalSearchParams<{ id: string }>()
  const referralId = typeof id === "string" ? id : ""
  const referralQuery = useReferral(referralId, locale)
  const cancelReferral = useCancelReferral()
  const referral = referralQuery.data
  const profileQuery = usePatientProfileById(referral?.profileId ?? "")
  const doctorsOffice = referral?.doctorsOffice
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      <QueryState
        isPending={referralQuery.isPending}
        isError={referralQuery.isError}
        error={referralQuery.error}
        onRetry={() => {
          void referralQuery.refetch()
        }}
        loadingLabel={t("loadingReferral")}
        style={{ backgroundColor: colors.screenBackground }}
      >
        {referral ? (
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
                  title={t("actionReferral")}
                  trailing={
                    <IconButton
                      icon={MessageCircle}
                      variant="foreground"
                      accessibilityLabel={t("openChat")}
                      onPress={() => {
                        Alert.alert(t("actionReferral"), t("placeholderComingSoon"))
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
                    <ThemedText
                      style={{
                        ...theme.typography.heading.md,
                        color: colors.name,
                      }}
                    >
                      {doctorsOffice?.name}
                    </ThemedText>
                    <ThemedText
                      style={{
                        ...theme.typography.body.sm,
                        color: colors.specialty,
                      }}
                    >
                      {doctorsOffice?.specialization}
                    </ThemedText>
                  </View>
                  <Chip
                    size="sm"
                    variant="tonal"
                    color={
                      referral.status === "inProgress"
                        ? theme.colors.warning
                        : referral.status === "cancelled"
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
                        {t("patientRequestStatus", { status: referral.status })}
                      </ThemedText>
                    </View>
                  </Chip>
                </View>
              </Card>

              <View>
                <DetailRow label={t("patient")} value={patientName ?? "—"} />
                <Divider />
                <DetailRow
                  label={t("referralToSpecialist")}
                  value={referral.specialistName}
                />
              </View>

              {referral.reason.trim().length > 0 ? (
                <View style={{ gap: theme.spacing.sm }}>
                  <ThemedText
                    appearance="description"
                    style={theme.typography.body.md}
                  >
                    {t("referralReason")}
                  </ThemedText>
                  <Text
                    style={{
                      ...theme.typography.body.md,
                      fontWeight: theme.fontWeights.semibold,
                      color: colors.rowValue,
                    }}
                  >
                    {referral.reason}
                  </Text>
                </View>
              ) : null}

              <View style={{ gap: theme.spacing.md, justifyContent: "flex-end", flexDirection: "row" }}>
                <Button
                  leadingIcon={RotateCw}
                  variant="tonal"
                  onPress={() => {
                    router.push({
                      pathname: "/requests/referral/create",
                      params: {
                        doctorId: referral.doctorsOffice.id,
                        reorderFrom: referral.id,
                      },
                    } as Href)
                  }}
                >
                  {t("orderAgain")}
                </Button>
                {referral.status !== "cancelled" ? (
                  <Button
                    color={theme.colors.negative}
                    variant="tonal"
                    disabled={cancelReferral.isPending}
                    onPress={() => {
                      Alert.alert(
                        t("cancelAppointmentRequest"),
                        t("cancelReferralConfirm"),
                        [
                          { text: t("cancel"), style: "cancel" },
                          {
                            text: t("cancelAppointmentRequest"),
                            style: "destructive",
                            onPress: () => {
                              void cancelReferral.mutateAsync({
                                referralId: referral.id,
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

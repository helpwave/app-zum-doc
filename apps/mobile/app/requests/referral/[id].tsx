import { AppBar } from "@/components/app-bar"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { patientProfileFullName, toAppLocale } from "@app-zum-doc/utils/api"
import { useCancelReferral, usePatientProfileById, useReferral } from "@app-zum-doc/utils/hooks"
import { OKLCHUtils } from "@helpwave/hightide-design/utils"
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
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { Clock, RotateCw } from "lucide-react-native"
import { useMemo, useState } from "react"
import { ColorValue, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const doctorPortrait = require("../../../assets/images/doctor-portrait.png")
const practiceLogo = require("../../../assets/images/practice-logo.png")

export default function ReferralDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { id } = useLocalSearchParams<{ id: string }>()
  const referralId = typeof id === "string" ? id : null
  const referralQuery = useReferral({ 
    parameters:  referralId === null ? undefined : {
      id: referralId,
      locale,
    }
  })
  const cancelReferral = useCancelReferral()
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const referral = referralQuery.data
  const profileQuery = usePatientProfileById({
    parameters:  referral?.profileId === undefined ? undefined : {
      profileId: referral?.profileId
    }
  })
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

  const heroColors = useMemo(() => {
    const color = theme.colors.referral.color
    const start = OKLCHUtils.changeLightness(color, 0.45)
    const end = OKLCHUtils.changeLightness(color, 0.6)
    const gradient: readonly [ColorValue, ColorValue, ...ColorValue[]] = [start, end]
    return gradient
  }, [theme.colors.referral.color])

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.color }}>
      <QueryState
        isPending={referralQuery.isPending}
        isError={referralQuery.isError}
        error={referralQuery.error}
        onRetry={() => {
          void referralQuery.refetch()
        }}
        loadingLabel={t("loadingReferral")}
      >
        {referral ? (
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
                title={t("actionReferral")}
                color={{color: "#FFFFFF00", onColor: theme.colors.referral.onColor}}
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
                  label={t("referralToSpecialist")}
                  value={referral.specialization}
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
                  <ThemedText
                    style={{
                      ...theme.typography.body.md,
                      fontWeight: theme.fontWeights.semibold,
                    }}
                  >
                    {referral.reason}
                  </ThemedText>
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
                    isProcessing={cancelReferral.isPending}
                    onPress={() => {
                      setCancelConfirmOpen(true)
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
      <ConfirmationModal
        isOpen={cancelConfirmOpen}
        onIsOpenChange={setCancelConfirmOpen}
        title={t("cancelAppointmentRequest")}
        message={t("cancelReferralConfirm")}
        cancelLabel={t("cancel")}
        confirmLabel={t("cancelAppointmentRequest")}
        confirmColor={theme.colors.negative}
        onConfirm={() => {
          if (!referral) {
            return
          }
          void cancelReferral.mutateAsync({
            referralId: referral.id,
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

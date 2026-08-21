import { LabeledField } from "@/components/labeled-field"
import { NavigationHeader } from "@/components/navigation-header"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { toAppLocale } from "@app-zum-doc/utils/api"
import {
  useCreateReferral,
  useDoctorSearch,
  useDoctorsOffice,
  useHomeSummary,
  usePatientProfiles,
  useReferral,
} from "@app-zum-doc/utils/hooks"
import {
  Button,
  IconButton,
  Input,
  Select,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { Ellipsis } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native"

export default function CreateReferralScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const params = useLocalSearchParams<{
    doctorId?: string | string[]
    reorderFrom?: string | string[]
  }>()
  const initialDoctorId = typeof params.doctorId === "string" ? params.doctorId : ""
  const reorderFrom =
    typeof params.reorderFrom === "string" ? params.reorderFrom : ""

  const homeQuery = useHomeSummary(locale)
  const profilesQuery = usePatientProfiles()
  const doctorsQuery = useDoctorSearch({ locale })
  const reorderQuery = useReferral(reorderFrom, locale)
  const createReferral = useCreateReferral()
  const profiles = useMemo(
    () => profilesQuery.data ?? [],
    [profilesQuery.data],
  )

  const [doctorId, setDoctorId] = useState(initialDoctorId)
  const [profileId, setProfileId] = useState("")
  const [specialistId, setSpecialistId] = useState("")
  const [reason, setReason] = useState("")
  const [didPrefillReorder, setDidPrefillReorder] = useState(false)

  const officeQuery = useDoctorsOffice(doctorId, locale)
  const specialistQuery = useDoctorsOffice(specialistId, locale)
  const doctorOptions = useMemo(() => {
    const options = (homeQuery.data?.myDoctors ?? []).map((doctor) => ({
      id: doctor.id,
      label: doctor.name,
    }))
    if (
      officeQuery.data
      && !options.some((option) => option.id === officeQuery.data.id)
    ) {
      return [
        { id: officeQuery.data.id, label: officeQuery.data.name },
        ...options,
      ]
    }
    return options
  }, [homeQuery.data?.myDoctors, officeQuery.data])
  const profileOptions = useMemo(
    () =>
      profiles.map((profile) => ({
        id: profile.id,
        label: t("profileSelf", { name: profile.fullName }),
      })),
    [profiles, t],
  )
  const specialistOptions = useMemo(() => {
    const options = (doctorsQuery.data ?? [])
      .filter((doctor) => doctor.id !== doctorId)
      .map((doctor) => ({
        id: doctor.id,
        label: doctor.name,
      }))
    if (
      specialistQuery.data
      && specialistQuery.data.id !== doctorId
      && !options.some((option) => option.id === specialistQuery.data.id)
    ) {
      return [
        { id: specialistQuery.data.id, label: specialistQuery.data.name },
        ...options,
      ]
    }
    return options
  }, [doctorId, doctorsQuery.data, specialistQuery.data])

  useEffect(() => {
    if (initialDoctorId) {
      setDoctorId(initialDoctorId)
    }
  }, [initialDoctorId])

  useEffect(() => {
    if (profiles.length === 1 && profiles[0]) {
      setProfileId(profiles[0].id)
    }
  }, [profiles])

  useEffect(() => {
    if (specialistId && specialistId === doctorId) {
      setSpecialistId("")
    }
  }, [doctorId, specialistId])

  useEffect(() => {
    if (didPrefillReorder || !reorderQuery.data) {
      return
    }
    const referral = reorderQuery.data
    setDoctorId(referral.doctorsOfficeId)
    setProfileId(referral.profileId)
    setSpecialistId(referral.specialistDoctorsOfficeId)
    setReason(referral.reason)
    setDidPrefillReorder(true)
  }, [didPrefillReorder, reorderQuery.data])

  const canSubmit =
    doctorId.length > 0
    && profileId.length > 0
    && specialistId.length > 0
    && reason.trim().length > 0
    && !createReferral.isPending

  const isPending =
    homeQuery.isPending
    || profilesQuery.isPending
    || doctorsQuery.isPending
    || (reorderFrom.length > 0 && reorderQuery.isPending && !didPrefillReorder)

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <NavigationHeader
        title={t("orderReferral")}
        onBack={() => router.back()}
        trailing={
          <IconButton
            icon={Ellipsis}
            size="sm"
            variant="foreground"
            accessibilityLabel={t("moreOptions")}
            onPress={() => {
              Alert.alert(t("orderReferral"), t("placeholderComingSoon"))
            }}
          />
        }
      />
      <QueryState
        isPending={isPending}
        isError={
          homeQuery.isError
          || profilesQuery.isError
          || doctorsQuery.isError
          || reorderQuery.isError
        }
        error={
          homeQuery.error
          ?? profilesQuery.error
          ?? doctorsQuery.error
          ?? reorderQuery.error
        }
        onRetry={() => {
          void homeQuery.refetch()
          void profilesQuery.refetch()
          void doctorsQuery.refetch()
          if (reorderFrom.length > 0) {
            void reorderQuery.refetch()
          }
        }}
        loadingLabel={t("loadingHome")}
        style={{ backgroundColor: colors.background }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LabeledField label={t("doctor")}>
            <Select
              options={doctorOptions}
              value={doctorId || undefined}
              onValueChange={setDoctorId}
              placeholder={t("selectPractice")}
              style={{ width: "100%" }}
            />
          </LabeledField>

          <LabeledField label={t("patient")}>
            <Select
              options={profileOptions}
              value={profileId || undefined}
              onValueChange={setProfileId}
              placeholder={t("patient")}
              showSearch={false}
              style={{ width: "100%" }}
            />
          </LabeledField>

          <LabeledField label={t("referralToSpecialist")}>
            <Select
              options={specialistOptions}
              value={specialistId || undefined}
              onValueChange={setSpecialistId}
              placeholder={t("selectSpecialist")}
              style={{ width: "100%" }}
            />
          </LabeledField>

          <LabeledField label={t("referralReason")}>
            <Input
              value={reason}
              onValueChange={setReason}
              placeholder={t("referralReasonPlaceholder")}
              multiline
              numberOfLines={4}
              style={{
                width: "100%",
                minHeight: theme.semantics.control.lg.size * 2,
                textAlignVertical: "top",
              }}
            />
          </LabeledField>

          <Button
            disabled={!canSubmit}
            onPress={() => {
              void createReferral.mutateAsync({
                locale,
                input: {
                  doctorsOfficeId: doctorId,
                  profileId,
                  specialistDoctorsOfficeId: specialistId,
                  reason,
                },
              }).then((referral) => {
                router.replace({
                  pathname: "/requests/referral/[id]",
                  params: { id: referral.id },
                } as Href)
              })
            }}
          >
            {t("orderReferral")}
          </Button>
        </ScrollView>
      </QueryState>
    </KeyboardAvoidingView>
  )
}

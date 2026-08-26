import { LabeledField } from "@/components/labeled-field"
import { NavigationHeader } from "@/components/navigation-header"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { patientProfileFullName, toAppLocale } from "@app-zum-doc/utils/api"
import {
  useCreateReferral,
  useDoctorsOffice,
  useHomeSummary,
  usePatientProfiles,
  useReferral,
  useSpecializations,
} from "@app-zum-doc/utils/hooks"
import {
  Button,
  IconButton,
  Input,
  Select,
  SelectOption,
  Textarea,
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
  const specializationsQuery = useSpecializations("", locale)
  const reorderQuery = useReferral(reorderFrom, locale)
  const createReferral = useCreateReferral()
  const profiles = useMemo(
    () => profilesQuery.data ?? [],
    [profilesQuery.data],
  )

  const [doctorId, setDoctorId] = useState(initialDoctorId)
  const [profileId, setProfileId] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [reason, setReason] = useState("")
  const [didPrefillReorder, setDidPrefillReorder] = useState(false)

  const officeQuery = useDoctorsOffice(doctorId, locale)
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
        label: t("profileSelf", { name: patientProfileFullName(profile) }),
      })),
    [profiles, t],
  )
  const specializationOptions = useMemo(
    () =>
      (specializationsQuery.data ?? []).map((item) => ({
        id: item.label,
        label: item.label,
      })),
    [specializationsQuery.data],
  )

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
    if (didPrefillReorder || !reorderQuery.data) {
      return
    }
    const referral = reorderQuery.data
    setDoctorId(referral.doctorsOffice.id)
    setProfileId(referral.profileId)
    setSpecialization(referral.specialization)
    setReason(referral.reason)
    setDidPrefillReorder(true)
  }, [didPrefillReorder, reorderQuery.data])

  const canSubmit =
    doctorId.length > 0
    && profileId.length > 0
    && specialization.trim().length > 0
    && reason.trim().length > 0
    && !createReferral.isPending

  const isPending =
    homeQuery.isPending
    || profilesQuery.isPending
    || specializationsQuery.isPending
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
      />
      <QueryState
        isPending={isPending}
        isError={
          homeQuery.isError
          || profilesQuery.isError
          || specializationsQuery.isError
          || reorderQuery.isError
        }
        error={
          homeQuery.error
          ?? profilesQuery.error
          ?? specializationsQuery.error
          ?? reorderQuery.error
        }
        onRetry={() => {
          void homeQuery.refetch()
          void profilesQuery.refetch()
          void specializationsQuery.refetch()
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
              value={doctorId || undefined}
              onValueChange={setDoctorId}
              placeholder={t("selectPractice")}
              style={{ width: "100%" }}
            >
              {doctorOptions.map((option) => (
                <SelectOption key={option.id} id={option.id} value={option.id} label={option.label} />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("patient")}>
            <Select
              value={profileId || undefined}
              onValueChange={setProfileId}
              placeholder={t("patient")}
              style={{ width: "100%" }}
            >
              {profileOptions.map((option) => (
                <SelectOption key={option.id} id={option.id} value={option.id} label={option.label} />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("referralToSpecialist")}>
            <Select
              value={specialization || undefined}
              onValueChange={setSpecialization}
              placeholder={t("selectSpecialization")}
              style={{ width: "100%" }}
            >
              {specializationOptions.map((option) => (
                <SelectOption key={option.id} id={option.id} value={option.id} label={option.label} />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("referralReason")}>
            <Textarea
              value={reason}
              onValueChange={setReason}
              placeholder={t("referralReasonPlaceholder")}
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
                  specialization,
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

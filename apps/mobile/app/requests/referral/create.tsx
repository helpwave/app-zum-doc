import { AppBar } from "@/components/app-bar"
import { LabeledField } from "@/components/labeled-field"
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
  Select,
  Textarea,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native"

type ReferralForm = {
  doctorId: string | null
  profileId: string | null
  specialization: string | null
  reason: string
  didPrefillReorder: boolean
}

type ReferralSource = {
  doctorId: string | null
  profiles: { id: string }[]
  reorder: {
    doctorsOffice: { id: string }
    profileId: string
    specialization: string
    reason: string
  } | undefined
}

const emptyReferralForm: ReferralForm = {
  doctorId: null,
  profileId: null,
  specialization: null,
  reason: "",
  didPrefillReorder: false,
}

function applyReferralSources(
  current: ReferralForm,
  previous: ReferralSource,
  next: ReferralSource,
) {
  if (next.reorder && next.reorder !== previous.reorder && !current.didPrefillReorder) {
    return {
      doctorId: next.reorder.doctorsOffice.id,
      profileId: next.reorder.profileId,
      specialization: next.reorder.specialization,
      reason: next.reorder.reason,
      didPrefillReorder: true,
    }
  }
  let form = current
  if (next.doctorId && next.doctorId !== previous.doctorId) {
    form = { ...form, doctorId: next.doctorId }
  }
  const onlyProfile = next.profiles.length === 1 ? next.profiles[0] : undefined
  if (next.profiles !== previous.profiles && onlyProfile) {
    form = { ...form, profileId: onlyProfile.id }
  }
  return form
}

export default function CreateReferralScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const params = useLocalSearchParams<{
    doctorId?: string | string[]
    reorderFrom?: string | string[]
  }>()
  const initialDoctorId = typeof params.doctorId === "string" ? params.doctorId : null
  const reorderFrom =
    typeof params.reorderFrom === "string" ? params.reorderFrom : null

  const homeQuery = useHomeSummary({ parameters: {locale} })
  const profilesQuery = usePatientProfiles()
  const specializationsQuery = useSpecializations({ parameters: {search: "", locale} })
  const reorderQuery = useReferral({parameters: !reorderFrom ? undefined : {
    id: reorderFrom,
    locale,
  }})
  const createReferral = useCreateReferral()
  const profiles = useMemo(
    () => profilesQuery.data ?? [],
    [profilesQuery.data],
  )

  const source: ReferralSource = {
    doctorId: initialDoctorId,
    profiles,
    reorder: reorderQuery.data,
  }
  const [form, setForm] = useState(() => applyReferralSources(
    emptyReferralForm,
    { doctorId: null, profiles: [], reorder: undefined },
    source,
  ))
  const [previousReferralSource, setPreviousReferralSource] = useState(source)
  if (
    source.doctorId !== previousReferralSource.doctorId
    || source.profiles !== previousReferralSource.profiles
    || source.reorder !== previousReferralSource.reorder
  ) {
    setPreviousReferralSource(source)
    setForm((current) => applyReferralSources(current, previousReferralSource, source))
  }

  const officeQuery = useDoctorsOffice({
    parameters: form.doctorId === null ? undefined : {
      id: form.doctorId,
      locale,
    }
  })
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
  const profileOptions = useMemo(() => {
    return profiles.map((profile) => ({
      id: profile.id,
      label: t("profileSelf", { name: patientProfileFullName(profile) }),
    }))
  }, [profiles, t])
  const specializationOptions = useMemo(
    () =>
      (specializationsQuery.data ?? []).map((item) => ({
        id: item.label,
        label: item.label,
      })),
    [specializationsQuery.data],
  )

  const canSubmit =
    form.doctorId != null
    && form.profileId != null
    && form.specialization != null
    && form.specialization.trim().length > 0
    && form.reason.trim().length > 0

  const isPending =
    homeQuery.isPending
    || profilesQuery.isPending
    || specializationsQuery.isPending
    || (reorderFrom != null && reorderQuery.isPending && !form.didPrefillReorder)

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppBar
        title={t("orderReferral")}
        showBackNavigation
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
          if (reorderFrom != null) {
            void reorderQuery.refetch()
          }
        }}
        loadingLabel={t("loadingHome")}
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
              value={form.doctorId}
              onValueChange={(doctorId) => {
                setForm((current) => ({ ...current, doctorId }))
              }}
              placeholder={t("selectPractice")}
              style={{ width: "100%" }}
            >
              {doctorOptions.map((option) => (
                <Select.Option key={option.id} value={option.id} label={option.label} />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("patient")}>
            <Select
              value={form.profileId}
              onValueChange={(profileId) => {
                setForm((current) => ({ ...current, profileId }))
              }}
              placeholder={t("patient")}
              style={{ width: "100%" }}
              readOnly={profileOptions.length < 2}
            >
              {profileOptions.map((option) => (
                <Select.Option key={option.id} value={option.id} label={option.label} />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("referralToSpecialist")}>
            <Select
              value={form.specialization}
              onValueChange={(specialization) => {
                setForm((current) => ({ ...current, specialization }))
              }}
              placeholder={t("selectSpecialization")}
              style={{ width: "100%" }}
            >
              {specializationOptions.map((option) => (
                <Select.Option key={option.id} value={option.id} label={option.label} />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("referralReason")}>
            <Textarea
              value={form.reason}
              onValueChange={(reason) => {
                setForm((current) => ({ ...current, reason }))
              }}
              placeholder={t("referralReasonPlaceholder")}
            />
          </LabeledField>

          <Button
            disabled={!canSubmit}
            isProcessing={createReferral.isPending}
            onPress={() => {
              if (form.doctorId == null || form.profileId == null || form.specialization == null) {
                return
              }
              void createReferral.mutateAsync({
                locale,
                input: {
                  doctorsOfficeId: form.doctorId,
                  profileId: form.profileId,
                  specialization: form.specialization,
                  reason: form.reason,
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

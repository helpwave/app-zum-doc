import { AddMedicationSheet } from "@/components/add-medication-sheet"
import { AppBar } from "@/components/app-bar"
import { LabeledField } from "@/components/labeled-field"
import { PrescriptionMedicationCard } from "@/components/prescription-medication-card"
import { QueryState } from "@/components/query-state"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  toAppLocale,
  patientProfileFullName,
  type MedicationSize,
} from "@app-zum-doc/utils/api"
import {
  useCreatePrescription,
  useDoctorsOffice,
  useHomeSummary,
  usePatientProfiles,
  usePrescription,
} from "@app-zum-doc/utils/hooks"
import {
  Button,
  Card,
  IconButton,
  ListActionItem,
  Select,
  Switch,
  Textarea,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { CircleMinus, Plus } from "lucide-react-native"
import { useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"

type DraftMedication = {
  key: string
  name: string
  size: MedicationSize
}

type PrescriptionForm = {
  doctorId: string | null
  profileId: string | null
  medications: DraftMedication[]
  shipByMail: boolean
  note: string
  didPrefillReorder: boolean
}

type PrescriptionParams = {
  profiles: { id: string }[]
  reorder: {
    doctorsOffice: { id: string }
    profileId: string
    shipByMail: boolean
    note: string
    medications: {
      id: string
      name: string
      size: MedicationSize
    }[]
  } | undefined
}

function applyPrescriptionParams(
  current: PrescriptionForm,
  previous: PrescriptionParams,
  next: PrescriptionParams,
) {
  if (next.reorder && next.reorder !== previous.reorder && !current.didPrefillReorder) {
    return {
      doctorId: next.reorder.doctorsOffice.id,
      profileId: next.reorder.profileId,
      shipByMail: next.reorder.shipByMail,
      note: next.reorder.note,
      medications: next.reorder.medications.map((medication) => ({
        key: medication.id,
        name: medication.name,
        size: medication.size,
      })),
      didPrefillReorder: true,
    }
  }
  const onlyProfile = next.profiles.length === 1 ? next.profiles[0] : undefined
  if (next.profiles !== previous.profiles && onlyProfile) {
    return { ...current, profileId: onlyProfile.id }
  }
  return current
}

export default function CreatePrescriptionScreen() {
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

  const homeQuery = useHomeSummary({ parameters: { locale } })
  const profilesQuery = usePatientProfiles()
  const reorderQuery = usePrescription({
    parameters: !reorderFrom ? undefined : {
      id: reorderFrom,
      locale,
    }
  })
  const createPrescription = useCreatePrescription()
  const profileOptions = useMemo(() => {
    return (profilesQuery.data ?? []).map((profile) => ({
      id: profile.id,
      label: t("profileSelf", { name: patientProfileFullName(profile) }),
    }))
  }, [profilesQuery.data, t])

  const paramsSource: PrescriptionParams = {
    profiles: profileOptions,
    reorder: reorderQuery.data,
  }
  const [form, setForm] = useState(() => applyPrescriptionParams(
    {
      doctorId: initialDoctorId,
      profileId: null,
      medications: [],
      shipByMail: false,
      note: "",
      didPrefillReorder: false,
    },
    { profiles: [], reorder: undefined },
    paramsSource,
  ))
  const [initialParams, setInitialParams] = useState(paramsSource)
  if (
    paramsSource.profiles !== initialParams.profiles
    || paramsSource.reorder !== initialParams.reorder
  ) {
    setInitialParams(paramsSource)
    setForm((current) => applyPrescriptionParams(current, initialParams, paramsSource))
  }
  const [openSheet, setOpenSheet] = useState<"profile" | "medication" | null>(
    null,
  )

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

  const canSubmit =
    form.doctorId != null
    && form.profileId != null
    && form.medications.length > 0

  const isPending =
    homeQuery.isPending
    || profilesQuery.isPending
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
        title={t("orderPrescription")}
      />
      <QueryState
        isPending={isPending}
        isError={homeQuery.isError || profilesQuery.isError || reorderQuery.isError}
        error={homeQuery.error ?? profilesQuery.error ?? reorderQuery.error}
        onRetry={() => {
          void homeQuery.refetch()
          void profilesQuery.refetch()
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

          <LabeledField label={t("medicationsSection")}>
            <View style={{ flex: 1, gap: theme.spacing.md }}>
              {form.medications.map((medication) => (
                <View
                  key={medication.key}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <PrescriptionMedicationCard
                      name={medication.name}
                      size={medication.size}
                    />
                  </View>
                  <IconButton
                    icon={CircleMinus}
                    size="sm"
                    color={theme.colors.negative}
                    variant="foreground"
                    accessibilityLabel={t("deleteMedication")}
                    onPress={() => {
                      setForm((current) => ({
                        ...current,
                        medications: current.medications.filter((item) => item.key !== medication.key),
                      }))
                    }}
                  />
                </View>
              ))}
              <Button
                variant="outlined"
                leadingIcon={Plus}
                onPress={() => {
                  setOpenSheet("medication")
                }}
                style={{ flex: 1 }}
                textStyle={{ flexShrink: 1 }}
              >
                {t("addAnotherMedication")}
              </Button>
            </View>
          </LabeledField>

          <Card>
            <ListActionItem
              title={t("shipPrescriptionByMail")}
              onPress={() => {
                setForm((current) => ({ ...current, shipByMail: !current.shipByMail }))
              }}
              trailing={
                <Switch
                  value={form.shipByMail}
                  onValueChange={(shipByMail) => {
                    setForm((current) => ({ ...current, shipByMail }))
                  }}
                />
              }
            />
          </Card>

          <LabeledField label={t("appointmentNote")}>
            <Textarea
              value={form.note}
              onValueChange={(note) => {
                setForm((current) => ({ ...current, note }))
              }}
              placeholder={t("prescriptionNotePlaceholder")}
            />
          </LabeledField>

          <Button
            disabled={!canSubmit}
            isProcessing={createPrescription.isPending}
            onPress={() => {
              if (form.doctorId == null || form.profileId == null) {
                return
              }
              void createPrescription.mutateAsync({
                locale,
                input: {
                  doctorsOfficeId: form.doctorId,
                  profileId: form.profileId,
                  shipByMail: form.shipByMail,
                  note: form.note,
                  medications: form.medications.map((medication) => ({
                    name: medication.name,
                    size: medication.size,
                  })),
                },
              }).then((prescription) => {
                router.replace({
                  pathname: "/requests/prescription/[id]",
                  params: { id: prescription.id },
                } as Href)
              })
            }}
          >
            {t("orderPrescription")}
          </Button>
        </ScrollView>
      </QueryState>
      <AddMedicationSheet
        key={openSheet === "medication" ? "open" : "closed"}
        visible={openSheet === "medication"}
        onSubmit={(selection) => {
          setForm((current) => ({
            ...current,
            medications: [
              ...current.medications,
              {
                key: `${selection.catalogId}-${selection.size}-${Date.now()}`,
                name: selection.name,
                size: selection.size,
              },
            ],
          }))
          setOpenSheet(null)
        }}
        onClose={() => {
          setOpenSheet(null)
        }}
      />
    </KeyboardAvoidingView>
  )
}

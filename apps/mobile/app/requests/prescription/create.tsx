import { AddMedicationSheet } from "@/components/add-medication-sheet"
import { LabeledField } from "@/components/labeled-field"
import { NavigationHeader } from "@/components/navigation-header"
import { PrescriptionMedicationCard } from "@/components/prescription-medication-card"
import { QueryState } from "@/components/query-state"
import { SelectionSheet } from "@/components/selection-sheet"
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
  Input,
  ListActionItem,
  ListItem,
  ListNavigationItem,
  Select,
  SelectOption,
  Switch,
  Textarea,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { CircleMinus, Plus } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"

type DraftMedication = {
  key: string
  name: string
  size: MedicationSize
}

export default function CreatePrescriptionScreen() {
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
  const initialDoctorId = typeof params.doctorId === "string" ? params.doctorId : null
  const reorderFrom =
    typeof params.reorderFrom === "string" ? params.reorderFrom : null

  const homeQuery = useHomeSummary({ locale })
  const profilesQuery = usePatientProfiles()
  const reorderQuery = usePrescription({
    prescriptionId: reorderFrom,
    locale,
    enabled: reorderFrom != null,
  })
  const createPrescription = useCreatePrescription()
  const profiles = useMemo(
    () => profilesQuery.data ?? [],
    [profilesQuery.data],
  )

  const [doctorId, setDoctorId] = useState<string | null>(initialDoctorId)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [medications, setMedications] = useState<DraftMedication[]>([])
  const [shipByMail, setShipByMail] = useState(false)
  const [note, setNote] = useState("")
  const [openSheet, setOpenSheet] = useState<"profile" | "medication" | null>(
    null,
  )
  const [didPrefillReorder, setDidPrefillReorder] = useState(false)

  const officeQuery = useDoctorsOffice({
    doctorsOfficeId: doctorId,
    locale,
    enabled: doctorId != null,
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
  const selectedProfile = profiles.find((profile) => profile.id === profileId)
  const profileReadonly = profiles.length <= 1

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
    const prescription = reorderQuery.data
    setDoctorId(prescription.doctorsOffice.id)
    setProfileId(prescription.profileId)
    setShipByMail(prescription.shipByMail)
    setNote(prescription.note)
    setMedications(
      prescription.medications.map((medication) => ({
        key: medication.id,
        name: medication.name,
        size: medication.size,
      })),
    )
    setDidPrefillReorder(true)
  }, [didPrefillReorder, reorderQuery.data])

  const canSubmit =
    doctorId != null
    && profileId != null
    && medications.length > 0
    && !createPrescription.isPending

  const isPending =
    homeQuery.isPending
    || profilesQuery.isPending
    || (reorderFrom != null && reorderQuery.isPending && !didPrefillReorder)

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <NavigationHeader
        title={t("orderPrescription")}
        onBack={() => router.back()}
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
              value={doctorId}
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
            <Card>
              {profileReadonly ? (
                <ListItem
                  title={
                    selectedProfile
                      ? t("profileSelf", { name: patientProfileFullName(selectedProfile) })
                      : t("patient")
                  }
                />
              ) : (
                <ListNavigationItem
                  title={
                    selectedProfile
                      ? t("profileSelf", { name: patientProfileFullName(selectedProfile) })
                      : t("patient")
                  }
                  onPress={() => {
                    setOpenSheet("profile")
                  }}
                />
              )}
            </Card>
          </LabeledField>

          <LabeledField label={t("medicationsSection")}>
            <View style={{ flex: 1, gap: theme.spacing.md }}>
              {medications.map((medication) => (
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
                      setMedications((current) =>
                        current.filter((item) => item.key !== medication.key),
                      )
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
              >
                {t("addAnotherMedication")}
              </Button>
            </View>
          </LabeledField>

          <Card>
            <ListActionItem
              title={t("shipPrescriptionByMail")}
              onPress={() => {
                setShipByMail(!shipByMail)
              }}
              trailing={
                <Switch
                  value={shipByMail}
                  onValueChange={setShipByMail}
                />
              }
            />
          </Card>

          <LabeledField label={t("appointmentNote")}>
            <Textarea
              value={note}
              onValueChange={setNote}
              placeholder={t("prescriptionNotePlaceholder")}
            />
          </LabeledField>

          <Button
            disabled={!canSubmit}
            onPress={() => {
              if (doctorId == null || profileId == null) {
                return
              }
              void createPrescription.mutateAsync({
                locale,
                input: {
                  doctorsOfficeId: doctorId,
                  profileId,
                  shipByMail,
                  note,
                  medications: medications.map((medication) => ({
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

      <SelectionSheet
        visible={openSheet === "profile"}
        title={t("patient")}
        options={profiles.map((profile) => ({
          id: profile.id,
          label: t("profileSelf", { name: patientProfileFullName(profile) }),
        }))}
        value={profileId}
        onChange={setProfileId}
        onCancel={() => {
          setOpenSheet(null)
        }}
        onDone={() => {
          setOpenSheet(null)
        }}
      />
      <AddMedicationSheet
        visible={openSheet === "medication"}
        onSubmit={(selection) => {
          setMedications((current) => [
            ...current,
            {
              key: `${selection.catalogId}-${selection.size}-${Date.now()}`,
              name: selection.name,
              size: selection.size,
            },
          ])
          setOpenSheet(null)
        }}
        onClose={() => {
          setOpenSheet(null)
        }}
      />
    </KeyboardAvoidingView>
  )
}

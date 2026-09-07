import { AppBar } from "@/components/app-bar"
import { DateInput } from "@/components/date-input"
import { LabeledField } from "@/components/labeled-field"
import { QueryState } from "@/components/query-state"
import { TimeSlotInput } from "@/components/time-slot-input"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
  isOfficeOpenOnDate,
  parseIsoDate,
  timeSlotsOnDate,
  toAppLocale,
  patientProfileFullName,
} from "@app-zum-doc/utils/api"
import {
  useCreateAppointment,
  useDoctorsOffice,
  useHomeSummary,
  usePatientProfiles,
} from "@app-zum-doc/utils/hooks"
import {
  Button,
  Card,
  ListActionItem,
  Select,
  Switch,
  Textarea,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native"

export default function RequestAppointmentScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { doctorId: doctorIdParam } = useLocalSearchParams<{
    doctorId?: string | string[]
  }>()
  const initialDoctorId = typeof doctorIdParam === "string" ? doctorIdParam : null

  const homeQuery = useHomeSummary({ parameters: { locale } })
  const profilesQuery = usePatientProfiles()
  const createAppointment = useCreateAppointment()
  const profileOptions = useMemo(() => {
    return (profilesQuery.data ?? []).map((profile) => ({
      id: profile.id,
      label: t("profileSelf", { name: patientProfileFullName(profile) }),
    }))
  }, [profilesQuery.data, t])

  const [doctorId, setDoctorId] = useState<string | null>(initialDoctorId)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [date, setDate] = useState<string | undefined>()
  const [time, setTime] = useState<string | undefined>()
  const [isEmergency, setIsEmergency] = useState(false)
  const [note, setNote] = useState("")

  const officeQuery = useDoctorsOffice({
    parameters: doctorId === null ? undefined : {
      id: doctorId,
      locale
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
  const openingHours = officeQuery.data?.openingHours
  const timeSlots = useMemo(() => {
    if (!openingHours || !date) {
      return []
    }
    return timeSlotsOnDate(openingHours, parseIsoDate(date))
  }, [date, openingHours])

  useEffect(() => {
    if (initialDoctorId) {
      setDoctorId(initialDoctorId)
    }
  }, [initialDoctorId])

  useEffect(() => {
    if (profileOptions.length === 1 && profileOptions[0]) {
      setProfileId(profileOptions[0].id)
    }
  }, [profileOptions])

  useEffect(() => {
    if (!date || !openingHours) {
      return
    }
    if (!isOfficeOpenOnDate(openingHours, parseIsoDate(date))) {
      setDate(undefined)
      setTime(undefined)
    }
  }, [date, openingHours])

  useEffect(() => {
    if (time && !timeSlots.includes(time)) {
      setTime(undefined)
    }
  }, [time, timeSlots])

  const canSubmit =
    doctorId != null
    && profileId != null
    && date != null
    && time != null

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppBar
        title={t("requestAppointment")}
      />
      <QueryState
        isPending={homeQuery.isPending || profilesQuery.isPending}
        isError={homeQuery.isError || profilesQuery.isError}
        error={homeQuery.error ?? profilesQuery.error}
        onRetry={() => {
          void homeQuery.refetch()
          void profilesQuery.refetch()
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
          <LabeledField label={t("practice")}>
            <Select
              value={doctorId}
              onValueChange={setDoctorId}
              placeholder={t("selectPractice")}
            >
              {doctorOptions.map((option) => (
                <Select.Option
                  key={option.id}
                  value={option.id}
                  label={option.label}
                />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("selectProfile")}>
            <Select
              value={profileId}
              onValueChange={setProfileId}
              placeholder={t("patient")}
              style={{ width: "100%" }}
              readOnly={profileOptions.length < 2}
            >
              {profileOptions.map((option) => (
                <Select.Option key={option.id} value={option.id} label={option.label} />
              ))}
            </Select>
          </LabeledField>

          <LabeledField label={t("selectDay")}>
            <DateInput
              value={date}
              onValueChange={setDate}
              placeholder={t("selectDay")}
              title={t("selectDay")}
              disabled={!doctorId || officeQuery.isPending}
              isDateEnabled={(nextDate) =>
                openingHours != null && isOfficeOpenOnDate(openingHours, nextDate)
              }
            />
          </LabeledField>

          <LabeledField label={t("appointmentTime")}>
            <TimeSlotInput
              value={time}
              onValueChange={setTime}
              slots={timeSlots}
              placeholder={t("selectTimePlaceholder")}
              title={t("selectTime")}
              disabled={!date}
            />
          </LabeledField>

          <Card>
            <ListActionItem
              title={t("isEmergency")}
              onPress={() => {
                setIsEmergency(!isEmergency)
              }}
              trailing={
                <Switch
                  value={isEmergency}
                  onValueChange={setIsEmergency}
                />
              }
            />
          </Card>

          <LabeledField label={t("appointmentNote")}>
            <Textarea
              value={note}
              onValueChange={setNote}
              placeholder={t("appointmentNotePlaceholder")}
            />
          </LabeledField>

          <Button
            disabled={!canSubmit}
            isProcessing={createAppointment.isPending}
            onPress={() => {
              if (!date || !time || doctorId == null || profileId == null) {
                return
              }
              void createAppointment.mutateAsync({
                locale,
                input: {
                  doctorsOfficeId: doctorId,
                  profileId,
                  date,
                  time,
                  isEmergency,
                  note,
                },
              }).then((appointment) => {
                router.replace({
                  pathname: "/requests/appointment/[id]",
                  params: { id: appointment.id },
                } as Href)
              })
            }}
            style={{alignSelf: "flex-end"}}
          >
            {t("sendAppointmentRequest")}
          </Button>
        </ScrollView>
      </QueryState>
    </KeyboardAvoidingView>
  )
}

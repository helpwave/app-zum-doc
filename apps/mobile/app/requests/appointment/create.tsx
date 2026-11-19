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
  type DoctorsOfficeOpeningHours,
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
import { useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native"

type AppointmentForm = {
  doctorId: string | null
  profileId: string | null
  date?: string
  time?: string
  isEmergency: boolean
  note: string
}

type AppointmentParams = {
  profiles: { id: string }[]
  openingHours: DoctorsOfficeOpeningHours | undefined
  timeSlots: string[]
}

function applyAppointmentParams(
  current: AppointmentForm,
  previous: AppointmentParams,
  next: AppointmentParams,
) {
  let form = current
  const onlyProfile = next.profiles.length === 1 ? next.profiles[0] : undefined
  if (next.profiles !== previous.profiles && onlyProfile) {
    form = { ...form, profileId: onlyProfile.id }
  }
  if (
    next.openingHours !== previous.openingHours
    && form.date
    && next.openingHours
    && !isOfficeOpenOnDate(next.openingHours, parseIsoDate(form.date))
  ) {
    form = { ...form, date: undefined, time: undefined }
  }
  if (
    next.timeSlots !== previous.timeSlots
    && form.time
    && !next.timeSlots.includes(form.time)
  ) {
    form = { ...form, time: undefined }
  }
  return form
}

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

  const [form, setForm] = useState(() => applyAppointmentParams(
    {
      doctorId: initialDoctorId,
      profileId: null,
      isEmergency: false,
      note: "",
    },
    { profiles: [], openingHours: undefined, timeSlots: [] },
    { profiles: profileOptions, openingHours: undefined, timeSlots: [] },
  ))

  const officeQuery = useDoctorsOffice({
    parameters: form.doctorId === null ? undefined : {
      id: form.doctorId,
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
    if (!openingHours || !form.date) {
      return []
    }
    return timeSlotsOnDate(openingHours, parseIsoDate(form.date))
  }, [form.date, openingHours])
  const paramsSource: AppointmentParams = {
    profiles: profileOptions,
    openingHours,
    timeSlots,
  }
  const [initialParams, setInitialParams] = useState(paramsSource)
  if (
    paramsSource.profiles !== initialParams.profiles
    || paramsSource.openingHours !== initialParams.openingHours
    || paramsSource.timeSlots !== initialParams.timeSlots
  ) {
    setInitialParams(paramsSource)
    setForm((current) => applyAppointmentParams(current, initialParams, paramsSource))
  }

  const canSubmit =
    form.doctorId != null
    && form.profileId != null
    && form.date != null
    && form.time != null

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
              value={form.doctorId}
              onValueChange={(doctorId) => {
                setForm((current) => ({ ...current, doctorId }))
              }}
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

          <LabeledField label={t("selectDay")}>
            <DateInput
              value={form.date}
              onValueChange={(date) => {
                setForm((current) => {
                  const slots = openingHours
                    ? timeSlotsOnDate(openingHours, parseIsoDate(date))
                    : []
                  return {
                    ...current,
                    date,
                    time: current.time && slots.includes(current.time) ? current.time : undefined,
                  }
                })
              }}
              placeholder={t("selectDay")}
              title={t("selectDay")}
              disabled={!form.doctorId || officeQuery.isPending}
              isDateEnabled={(nextDate) =>
                openingHours != null && isOfficeOpenOnDate(openingHours, nextDate)
              }
            />
          </LabeledField>

          <LabeledField label={t("appointmentTime")}>
            <TimeSlotInput
              value={form.time}
              onValueChange={(time) => {
                setForm((current) => ({ ...current, time }))
              }}
              slots={timeSlots}
              placeholder={t("selectTimePlaceholder")}
              title={t("selectTime")}
              disabled={!form.date}
            />
          </LabeledField>

          <Card>
            <ListActionItem
              title={t("isEmergency")}
              onPress={() => {
                setForm((current) => ({ ...current, isEmergency: !current.isEmergency }))
              }}
              trailing={
                <Switch
                  value={form.isEmergency}
                  onValueChange={(isEmergency) => {
                    setForm((current) => ({ ...current, isEmergency }))
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
              placeholder={t("appointmentNotePlaceholder")}
            />
          </LabeledField>

          <Button
            disabled={!canSubmit}
            isProcessing={createAppointment.isPending}
            onPress={() => {
              if (!form.date || !form.time || form.doctorId == null || form.profileId == null) {
                return
              }
              void createAppointment.mutateAsync({
                locale,
                input: {
                  doctorsOfficeId: form.doctorId,
                  profileId: form.profileId,
                  date: form.date,
                  time: form.time,
                  isEmergency: form.isEmergency,
                  note: form.note,
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

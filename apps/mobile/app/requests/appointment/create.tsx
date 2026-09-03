import { AppBar } from "@/components/app-bar"
import { DatePickerSheet } from "@/components/date-picker-sheet"
import { LabeledField } from "@/components/labeled-field"
import { QueryState } from "@/components/query-state"
import { SelectionSheet } from "@/components/selection-sheet"
import { TimeSlotSheet } from "@/components/time-slot-sheet"
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
  ListItem,
  ListNavigationItem,
  Select,
  Switch,
  Textarea,
  ThemedIcon
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { Calendar, ChevronRight } from "lucide-react-native"
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

  const homeQuery = useHomeSummary({ locale })
  const profilesQuery = usePatientProfiles()
  const createAppointment = useCreateAppointment()
  const profiles = useMemo(
    () => profilesQuery.data ?? [],
    [profilesQuery.data],
  )

  const [doctorId, setDoctorId] = useState<string | null>(initialDoctorId)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [date, setDate] = useState<string | undefined>()
  const [time, setTime] = useState<string | undefined>()
  const [isEmergency, setIsEmergency] = useState(false)
  const [note, setNote] = useState("")
  const [openSheet, setOpenSheet] = useState<
    "profile" | "date" | "time" | null
  >(null)

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
    if (profiles.length === 1 && profiles[0]) {
      setProfileId(profiles[0].id)
    }
  }, [profiles])

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
    && !createAppointment.isPending

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
            <Card>
              {profileReadonly ? (
                <ListItem
                  title={selectedProfile ? patientProfileFullName(selectedProfile) : t("selectProfile")}
                />
              ) : (
                <ListNavigationItem
                  title={selectedProfile ? patientProfileFullName(selectedProfile) : t("selectProfile")}
                  onPress={() => {
                    setOpenSheet("profile")
                  }}
                />
              )}
            </Card>
          </LabeledField>

          <LabeledField label={t("selectDay")}>
            <Card>
              <ListActionItem
                title={date ? formatShortDate(date, locale) : t("selectDay")}
                disabled={!doctorId || officeQuery.isPending}
                trailing={<ThemedIcon icon={Calendar} />}
                onPress={() => {
                  setOpenSheet("date")
                }}
              />
            </Card>
          </LabeledField>

          <LabeledField label={t("appointmentTime")}>
            <Card>
              <ListActionItem
                title={time ?? t("selectTimePlaceholder")}
                disabled={!date}
                trailing={<ThemedIcon icon={ChevronRight} />}
                onPress={() => {
                  setOpenSheet("time")
                }}
              />
            </Card>
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

      <SelectionSheet
        visible={openSheet === "profile"}
        title={t("selectProfile")}
        options={profiles.map((profile) => ({
          id: profile.id,
          label: patientProfileFullName(profile),
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
      <DatePickerSheet
        visible={openSheet === "date"}
        title={t("selectDay")}
        value={date}
        isDateEnabled={(nextDate) =>
          openingHours != null && isOfficeOpenOnDate(openingHours, nextDate)
        }
        onSelect={(nextDate) => {
          setDate(nextDate)
          setOpenSheet(null)
        }}
        onClose={() => {
          setOpenSheet(null)
        }}
      />
      <TimeSlotSheet
        visible={openSheet === "time"}
        title={t("selectTime")}
        slots={timeSlots}
        value={time}
        onSelect={(nextTime) => {
          setTime(nextTime)
          setOpenSheet(null)
        }}
        onClose={() => {
          setOpenSheet(null)
        }}
      />
    </KeyboardAvoidingView>
  )
}

function formatShortDate(isoDate: string, locale: string): string {
  return parseIsoDate(isoDate).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

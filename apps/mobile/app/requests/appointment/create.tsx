import {
  AzdAvatarImage,
  contactAvatarImage,
} from "@/components/azd-avatar-image"
import { DatePickerSheet } from "@/components/date-picker-sheet"
import { LabeledField } from "@/components/labeled-field"
import { NavigationHeader } from "@/components/navigation-header"
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
} from "@app-zum-doc/utils/api"
import {
  useCreateAppointment,
  useDoctorsOffice,
  useHomeSummary,
  usePatientProfiles,
} from "@app-zum-doc/utils/hooks"
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Input,
  ListActionItem,
  ListItem,
  ListNavigationItem,
  Switch,
  ThemedIcon,
} from "@helpwave/hightide-native/components"
import { useLocalization } from "@helpwave/hightide-native/global-contexts"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { Calendar, ChevronRight, Ellipsis } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native"

export default function RequestAppointmentScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const colors = theme.components.screen
  const router = useRouter()
  const { locale: localizationLocale } = useLocalization()
  const locale = toAppLocale(localizationLocale)
  const { doctorId: doctorIdParam } = useLocalSearchParams<{
    doctorId?: string | string[]
  }>()
  const initialDoctorId = typeof doctorIdParam === "string" ? doctorIdParam : ""

  const homeQuery = useHomeSummary(locale)
  const profilesQuery = usePatientProfiles()
  const createAppointment = useCreateAppointment()
  const myDoctors = homeQuery.data?.myDoctors ?? []
  const profiles = useMemo(
    () => profilesQuery.data ?? [],
    [profilesQuery.data],
  )

  const [doctorId, setDoctorId] = useState(initialDoctorId)
  const [profileId, setProfileId] = useState("")
  const [date, setDate] = useState<string | undefined>()
  const [time, setTime] = useState<string | undefined>()
  const [isEmergency, setIsEmergency] = useState(false)
  const [note, setNote] = useState("")
  const [openSheet, setOpenSheet] = useState<
    "doctor" | "profile" | "date" | "time" | null
  >(null)

  const officeQuery = useDoctorsOffice(doctorId, locale)
  const selectedDoctor =
    myDoctors.find((doctor) => doctor.id === doctorId)
    ?? (officeQuery.data && officeQuery.data.id === doctorId
      ? {
          id: officeQuery.data.id,
          name: officeQuery.data.name,
          specialty: officeQuery.data.specialty,
          phone: officeQuery.data.phone,
          imageUri: officeQuery.data.imageUri,
          initials: officeQuery.data.initials,
          status: officeQuery.data.status,
        }
      : undefined)
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
    doctorId.length > 0
    && profileId.length > 0
    && date != null
    && time != null
    && !createAppointment.isPending

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <NavigationHeader
        title={t("requestAppointment")}
        onBack={() => router.back()}
        trailing={
          <IconButton
            icon={Ellipsis}
            size="sm"
            variant="foreground"
            accessibilityLabel={t("moreOptions")}
            onPress={() => {
              Alert.alert(t("requestAppointment"), t("placeholderComingSoon"))
            }}
          />
        }
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
          <LabeledField label={t("practice")}>
            <Card>
              <ListNavigationItem
                title={selectedDoctor?.name ?? t("selectPractice")}
                leading={
                  <Avatar
                    name={selectedDoctor?.name ?? t("practice")}
                    size="sm"
                    image={contactAvatarImage(
                      selectedDoctor?.imageUri,
                      selectedDoctor?.name ?? t("practice"),
                    )}
                    ImageComponent={AzdAvatarImage}
                  />
                }
                onPress={() => {
                  setOpenSheet("doctor")
                }}
              />
            </Card>
          </LabeledField>

          <LabeledField label={t("selectProfile")}>
            <Card>
              {profileReadonly ? (
                <ListItem
                  title={selectedProfile?.fullName ?? t("selectProfile")}
                />
              ) : (
                <ListNavigationItem
                  title={selectedProfile?.fullName ?? t("selectProfile")}
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
            <ListItem
              title={t("isEmergency")}
              trailing={
                <Switch
                  value={isEmergency}
                  onValueChange={setIsEmergency}
                />
              }
            />
          </Card>

          <LabeledField label={t("appointmentNote")}>
            <Input
              value={note}
              onValueChange={setNote}
              placeholder={t("appointmentNotePlaceholder")}
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
              if (!date || !time) {
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
          >
            {t("sendAppointmentRequest")}
          </Button>
        </ScrollView>
      </QueryState>

      <SelectionSheet
        visible={openSheet === "doctor"}
        title={t("practice")}
        options={myDoctors.map((doctor) => ({
          id: doctor.id,
          label: doctor.name,
        }))}
        value={doctorId}
        onChange={setDoctorId}
        onCancel={() => {
          setOpenSheet(null)
        }}
        onDone={() => {
          setOpenSheet(null)
        }}
      />
      <SelectionSheet
        visible={openSheet === "profile"}
        title={t("selectProfile")}
        options={profiles.map((profile) => ({
          id: profile.id,
          label: profile.fullName,
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

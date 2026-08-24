import {
  appointmentsSeed,
  citiesSeed,
  conversationsSeed,
  doctorsOfficesSeed,
  initialMyDoctorIds,
  medicationCatalogSeed,
  messagesByConversation,
  patientMedicationsSeed,
  patientProfileSeed,
  patientProfilesSeed,
  prescriptionsSeed,
  referralsSeed,
  specializationsSeed,
  type DoctorsOfficeSeed,
  type LocalizedDoctorSeed,
  type LocalizedDoctorServiceSeed,
} from "./data"
import {
  WeekdayUtils,
  type Appointment,
  type AppointmentRecord,
  type AppLocale,
  type ConversationPreview,
  type CreateAppointmentInput,
  type CreatePrescriptionInput,
  type CreateReferralInput,
  type DoctorSearchFilters,
  type DoctorsOffice,
  type DoctorsOfficeOpeningHours,
  type Medication,
  type MedicationCatalogItem,
  type MedicationSize,
  type Message,
  type MessagePreview,
  type MyDoctors,
  type PatientProfile,
  type PatientProfileSummary,
  type PatientRequest,
  type Prescription,
  type PrescriptionRecord,
  type Referral,
  type ReferralRecord,
  type RequestBase,
  type SearchCity,
  type SearchSpecialization,
  type StructuredCardMessage,
  type TextMessage,
} from "../types"
import { parseIsoDate } from "../openingHours"

type HomeSummary = {
  myDoctors: DoctorsOffice[]
  recentRequests: RequestBase[]
}

const delayMs = 550

let conversationsState: ConversationPreview[] = structuredClone(conversationsSeed)
let messagesState: Record<string, Message[]> = structuredClone(
  messagesByConversation,
)
let myDoctorIds = new Set<string>(initialMyDoctorIds)
let patientMedicationsState: Medication[] = structuredClone(patientMedicationsSeed)
let appointmentsState: AppointmentRecord[] = structuredClone(appointmentsSeed)
let prescriptionsState: PrescriptionRecord[] = structuredClone(prescriptionsSeed)
let referralsState: ReferralRecord[] = structuredClone(referralsSeed)

export const mockApiConfig = {
  forceFail: false,
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function withMockLatency<T>(
  work: () => T,
  options?: { failKey?: string },
): Promise<T> {
  await sleep(delayMs)

  const shouldFail =
    mockApiConfig.forceFail ||
    options?.failKey?.toLowerCase() === "fehler" ||
    process.env.EXPO_PUBLIC_MOCK_FAIL === "1"

  if (shouldFail) {
    throw new Error("Die Daten konnten nicht geladen werden. Bitte erneut versuchen.")
  }

  return work()
}

export async function fetchConversations(): Promise<ConversationPreview[]> {
  return withMockLatency(() =>
    conversationsState.map((conversation) => ({ ...conversation })),
  )
}

export async function fetchConversation(
  conversationId: string,
): Promise<ConversationPreview> {
  return withMockLatency(() => {
    const conversation = conversationsState.find(
      (item) => item.id === conversationId,
    )
    if (!conversation) {
      throw new Error("Unterhaltung nicht gefunden.")
    }
    return { ...conversation }
  })
}

export async function fetchMessages(
  conversationId: string,
): Promise<Message[]> {
  return withMockLatency(() => {
    const messages = messagesState[conversationId] ?? []
    return messages.map((message) => ({ ...message }))
  })
}

export async function markConversationRead(
  conversationId: string,
): Promise<ConversationPreview[]> {
  return withMockLatency(() => {
    conversationsState = conversationsState.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }
      return { ...conversation, unreadCount: 0 }
    })
    return conversationsState.map((conversation) => ({ ...conversation }))
  })
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<Message[]> {
  return withMockLatency(() => {
    const now = new Date()
    const message: TextMessage = {
      id: `msg-local-${Date.now()}`,
      type: "text",
      direction: "outgoing",
      status: "sent",
      body,
      time: now,
    }

    const existing = messagesState[conversationId] ?? []
    messagesState = {
      ...messagesState,
      [conversationId]: [...existing, message],
    }

    const lastMessage: MessagePreview = {
      id: message.id,
      preview: body,
      time: now,
      direction: "outgoing",
      status: "sent",
    }

    conversationsState = conversationsState.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }
      return {
        ...conversation,
        lastMessage,
        unreadCount: 0,
      }
    })

    return (messagesState[conversationId] ?? []).map((item) => ({ ...item }))
  })
}

export async function resolveCardAction(
  conversationId: string,
  messageId: string,
  actionId: string,
): Promise<Message[]> {
  return withMockLatency(() => {
    const existing = messagesState[conversationId] ?? []
    const next: Message[] = existing.map((message) => {
      if (message.id !== messageId || message.type !== "card") {
        return message
      }

      const card = message as StructuredCardMessage
      return {
        ...card,
        selectedActionId: actionId,
        actions: undefined,
      }
    })

    if (actionId === "accept") {
      next.push({
        id: `msg-system-${Date.now()}`,
        type: "system",
        body: "Termin bestätigt · Mi. 8. Juli 2026 · 15:00 Uhr",
      })
    }

    messagesState = {
      ...messagesState,
      [conversationId]: next,
    }

    return next.map((message) => ({ ...message }))
  })
}

export async function fetchHomeSummary(locale: AppLocale): Promise<HomeSummary> {
  return withMockLatency(() => ({
    myDoctors: [...myDoctorIds].flatMap((id) => {
      const office = doctorsOfficesSeed[id]
      return office ? [toDoctorsOffice(office, locale)] : []
    }),
    recentRequests: buildRecentRequests(locale),
  }))
}

export async function fetchPatientProfile(): Promise<PatientProfile> {
  return withMockLatency(() => ({ ...patientProfileSeed }))
}

export async function fetchPatientProfileById(
  profileId: string,
): Promise<PatientProfile> {
  return withMockLatency(() => {
    if (patientProfileSeed.id === profileId) {
      return { ...patientProfileSeed }
    }
    throw new Error("Profil nicht gefunden.")
  })
}

export async function fetchPatientProfiles(): Promise<PatientProfileSummary[]> {
  return withMockLatency(() =>
    patientProfilesSeed.map((profile) => ({ ...profile })),
  )
}

function resolveDoctorsOffice(
  doctorsOfficeId: string,
  locale: AppLocale,
): DoctorsOffice {
  const office = doctorsOfficesSeed[doctorsOfficeId]
  if (!office) {
    throw new Error("Arztpraxis nicht gefunden.")
  }
  return toDoctorsOffice(office, locale)
}

function formatRequestDate(isoDate: string, locale: AppLocale): string {
  return parseIsoDate(isoDate).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function appointmentTitle(record: AppointmentRecord, locale: AppLocale): string {
  const date = formatRequestDate(record.date, locale)
  if (locale === "de-DE") {
    return `Terminanfrage (${date})`
  }
  return `Appointment request (${date})`
}

function prescriptionTitle(record: PrescriptionRecord, locale: AppLocale): string {
  const medicationNames = record.medications
    .map((medication) => medication.name)
    .join(", ")
  if (locale === "de-DE") {
    return `Rezeptanfrage (${medicationNames})`
  }
  return `Prescription request (${medicationNames})`
}

function referralTitle(record: ReferralRecord, locale: AppLocale): string {
  const specialist =
    doctorsOfficesSeed[record.specialistDoctorsOfficeId]?.name
    ?? record.specialistName
  if (locale === "de-DE") {
    return `Überweisung an ${specialist}`
  }
  return `Referral to ${specialist}`
}

function buildRecentRequests(locale: AppLocale): PatientRequest[] {
  return [
    ...prescriptionsState.map((record) => toPrescription(record, locale)),
    ...referralsState.map((record) => toReferral(record, locale)),
    ...appointmentsState.map((record) => toAppointment(record, locale)),
  ]
}

function toAppointment(
  record: AppointmentRecord,
  locale: AppLocale,
): Appointment {
  const { doctorsOfficeId, ...rest } = record
  return {
    ...rest,
    kind: "appointment",
    title: appointmentTitle(record, locale),
    doctorsOffice: resolveDoctorsOffice(doctorsOfficeId, locale),
  }
}

function toPrescription(
  record: PrescriptionRecord,
  locale: AppLocale,
): Prescription {
  const { doctorsOfficeId, ...rest } = record
  return {
    ...rest,
    kind: "prescription",
    title: prescriptionTitle(record, locale),
    doctorsOffice: resolveDoctorsOffice(doctorsOfficeId, locale),
    medications: rest.medications.map((medication) => ({ ...medication })),
  }
}

function toReferral(record: ReferralRecord, locale: AppLocale): Referral {
  const { doctorsOfficeId, ...rest } = record
  const specialist = doctorsOfficesSeed[rest.specialistDoctorsOfficeId]
  return {
    ...rest,
    kind: "referral",
    title: referralTitle(record, locale),
    doctorsOffice: resolveDoctorsOffice(doctorsOfficeId, locale),
    specialistName: specialist?.name ?? rest.specialistName,
  }
}

export async function fetchAppointment(
  appointmentId: string,
  locale: AppLocale,
): Promise<Appointment> {
  return withMockLatency(() => {
    const appointment = appointmentsState.find((item) => item.id === appointmentId)
    if (!appointment) {
      throw new Error("Termin nicht gefunden.")
    }
    return toAppointment(appointment, locale)
  })
}

export async function createAppointment(
  input: CreateAppointmentInput,
  locale: AppLocale,
): Promise<Appointment> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[input.doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    const profile =
      patientProfilesSeed.find((item) => item.id === input.profileId)
      ?? patientProfilesSeed[0]
    if (!profile) {
      throw new Error("Profil nicht gefunden.")
    }

    const appointment: AppointmentRecord = {
      id: `req-appointment-${Date.now()}`,
      doctorsOfficeId: office.id,
      profileId: profile.id,
      date: input.date,
      time: input.time,
      isEmergency: input.isEmergency,
      note: input.note,
      status: "requested",
    }
    appointmentsState = [appointment, ...appointmentsState]
    return toAppointment(appointment, locale)
  })
}

export async function cancelAppointment(
  appointmentId: string,
  locale: AppLocale,
): Promise<Appointment> {
  return withMockLatency(() => {
    const existing = appointmentsState.find((item) => item.id === appointmentId)
    if (!existing) {
      throw new Error("Termin nicht gefunden.")
    }
    const appointment: AppointmentRecord = {
      ...existing,
      status: "cancelled",
    }
    appointmentsState = appointmentsState.map((item) =>
      item.id === appointmentId ? appointment : item,
    )
    return toAppointment(appointment, locale)
  })
}

export async function fetchPrescription(
  prescriptionId: string,
  locale: AppLocale,
): Promise<Prescription> {
  return withMockLatency(() => {
    const prescription = prescriptionsState.find((item) => item.id === prescriptionId)
    if (!prescription) {
      throw new Error("Rezept nicht gefunden.")
    }
    return toPrescription(prescription, locale)
  })
}

export async function createPrescription(
  input: CreatePrescriptionInput,
  locale: AppLocale,
): Promise<Prescription> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[input.doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    const profile =
      patientProfilesSeed.find((item) => item.id === input.profileId)
      ?? patientProfilesSeed[0]
    if (!profile) {
      throw new Error("Profil nicht gefunden.")
    }
    if (input.medications.length === 0) {
      throw new Error("Bitte fügen Sie mindestens ein Medikament hinzu.")
    }

    const prescription: PrescriptionRecord = {
      id: `req-prescription-${Date.now()}`,
      doctorsOfficeId: office.id,
      profileId: profile.id,
      shipByMail: input.shipByMail,
      note: input.note,
      medications: input.medications.map((medication, index) => ({
        id: `rx-med-${Date.now()}-${index}`,
        name: medication.name,
        size: medication.size,
      })),
      status: "inProgress",
    }
    prescriptionsState = [prescription, ...prescriptionsState]
    return toPrescription(prescription, locale)
  })
}

export async function cancelPrescription(
  prescriptionId: string,
  locale: AppLocale,
): Promise<Prescription> {
  return withMockLatency(() => {
    const existing = prescriptionsState.find((item) => item.id === prescriptionId)
    if (!existing) {
      throw new Error("Rezept nicht gefunden.")
    }
    const prescription: PrescriptionRecord = {
      ...existing,
      status: "cancelled",
    }
    prescriptionsState = prescriptionsState.map((item) =>
      item.id === prescriptionId ? prescription : item,
    )
    return toPrescription(prescription, locale)
  })
}

export async function fetchReferral(
  referralId: string,
  locale: AppLocale,
): Promise<Referral> {
  return withMockLatency(() => {
    const referral = referralsState.find((item) => item.id === referralId)
    if (!referral) {
      throw new Error("Überweisung nicht gefunden.")
    }
    return toReferral(referral, locale)
  })
}

export async function createReferral(
  input: CreateReferralInput,
  locale: AppLocale,
): Promise<Referral> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[input.doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    const specialist = doctorsOfficesSeed[input.specialistDoctorsOfficeId]
    if (!specialist) {
      throw new Error("Facharzt nicht gefunden.")
    }
    const profile =
      patientProfilesSeed.find((item) => item.id === input.profileId)
      ?? patientProfilesSeed[0]
    if (!profile) {
      throw new Error("Profil nicht gefunden.")
    }

    const referral: ReferralRecord = {
      id: `req-referral-${Date.now()}`,
      doctorsOfficeId: office.id,
      profileId: profile.id,
      specialistDoctorsOfficeId: specialist.id,
      specialistName: specialist.name,
      reason: input.reason,
      status: "inProgress",
    }
    referralsState = [referral, ...referralsState]
    return toReferral(referral, locale)
  })
}

export async function cancelReferral(
  referralId: string,
  locale: AppLocale,
): Promise<Referral> {
  return withMockLatency(() => {
    const existing = referralsState.find((item) => item.id === referralId)
    if (!existing) {
      throw new Error("Überweisung nicht gefunden.")
    }
    const referral: ReferralRecord = {
      ...existing,
      status: "cancelled",
    }
    referralsState = referralsState.map((item) =>
      item.id === referralId ? referral : item,
    )
    return toReferral(referral, locale)
  })
}

export async function fetchPatientMedications(): Promise<Medication[]> {
  return withMockLatency(() =>
    patientMedicationsState.map((medication) => ({ ...medication })),
  )
}

export async function searchMedications(params: {
  search?: string
}): Promise<MedicationCatalogItem[]> {
  return withMockLatency(() => {
    const query = params.search?.trim().toLowerCase() ?? ""
    return medicationCatalogSeed
      .filter((item) => !query || matchesQuery(item.name, query))
      .map((item) => ({ ...item }))
  }, { failKey: params.search })
}

export async function addPatientMedication(params: {
  catalogId: string
  size: MedicationSize
}): Promise<Medication[]> {
  return withMockLatency(() => {
    const catalogItem = medicationCatalogSeed.find(
      (item) => item.id === params.catalogId,
    )
    if (!catalogItem) {
      throw new Error("Medikament nicht gefunden.")
    }

    const alreadyAdded = patientMedicationsState.some(
      (medication) =>
        medication.name === catalogItem.name && medication.size === params.size,
    )
    if (!alreadyAdded) {
      patientMedicationsState = [
        ...patientMedicationsState,
        {
          id: `med-${catalogItem.id}-${params.size}-${Date.now()}`,
          name: catalogItem.name,
          size: params.size,
        },
      ]
    }

    return patientMedicationsState.map((medication) => ({ ...medication }))
  })
}

export async function removePatientMedication(
  medicationId: string,
): Promise<Medication[]> {
  return withMockLatency(() => {
    patientMedicationsState = patientMedicationsState.filter(
      (medication) => medication.id !== medicationId,
    )
    return patientMedicationsState.map((medication) => ({ ...medication }))
  })
}

function localizedSpecialty(office: DoctorsOfficeSeed, locale: AppLocale): string {
  return (
    office.specialization?.[locale]
    ?? specializationsSeed.find((item) => item.id === office.specializationId)?.labels[locale]
    ?? ""
  )
}

function localizedDoctorServices(
  services: LocalizedDoctorServiceSeed[],
  locale: AppLocale,
) {
  return services.map((service) => ({
    id: service.id,
    name: service.name[locale],
    description: service.description[locale],
  }))
}

function localizedDoctors(
  doctors: LocalizedDoctorSeed[],
  locale: AppLocale,
) {
  return doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name[locale],
    imageUri: doctor.imageUri,
  }))
}

function cloneOpeningHours(
  hours: DoctorsOfficeOpeningHours,
): DoctorsOfficeOpeningHours {
  return WeekdayUtils.array.reduce((next, day) => {
    next[day] = [...(hours[day] ?? [])]
    return next
  }, {} as DoctorsOfficeOpeningHours)
}

function toDoctorsOffice(
  office: DoctorsOfficeSeed,
  locale: AppLocale,
): DoctorsOffice {
  return {
    id: office.id,
    name: office.name,
    specialization: localizedSpecialty(office, locale),
    phoneNumber: office.phoneNumber,
    ...(office.imageUri ? { imageUri: office.imageUri } : {}),
    services: localizedDoctorServices(office.services ?? [], locale),
    offers: localizedDoctorServices(office.offers ?? [], locale),
    doctors: localizedDoctors(
      office.doctors ?? [
        {
          id: `${office.id}-doctor`,
          name: { "de-DE": office.name, "en-US": office.name },
          imageUri: office.imageUri ?? undefined,
        },
      ],
      locale,
    ),
    address: { ...office.address },
    websiteUrl: office.websiteUrl,
    openingHours: cloneOpeningHours(office.openingHours),
  }
}

export async function fetchMyDoctors(): Promise<MyDoctors> {
  return withMockLatency(() => ({
    doctorIds: [...myDoctorIds],
  }))
}

export async function fetchDoctorsOffice(
  doctorsOfficeId: string,
  locale: AppLocale,
): Promise<DoctorsOffice> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    return toDoctorsOffice(office, locale)
  })
}

export async function addMyDoctor(doctorsOfficeId: string): Promise<MyDoctors> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    myDoctorIds.add(office.id)
    return { doctorIds: [...myDoctorIds] }
  })
}

export async function removeMyDoctor(doctorsOfficeId: string): Promise<MyDoctors> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    myDoctorIds.delete(office.id)
    return { doctorIds: [...myDoctorIds] }
  })
}

function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query)
}

export async function fetchCities(params: {
  search?: string
  locale: AppLocale
}): Promise<SearchCity[]> {
  return withMockLatency(() => {
    const query = params.search?.trim().toLowerCase() ?? ""
    return citiesSeed
      .map((city) => ({
        id: city.id,
        label: city.labels[params.locale],
      }))
      .filter((city) => !query || matchesQuery(city.label, query))
  }, { failKey: params.search })
}

export async function fetchSpecializations(params: {
  search?: string
  locale: AppLocale
}): Promise<SearchSpecialization[]> {
  return withMockLatency(() => {
    const query = params.search?.trim().toLowerCase() ?? ""
    return specializationsSeed
      .map((specialization) => ({
        id: specialization.id,
        label: specialization.labels[params.locale],
      }))
      .filter((specialization) => !query || matchesQuery(specialization.label, query))
  }, { failKey: params.search })
}

export async function fetchDoctors(
  filters: DoctorSearchFilters,
): Promise<DoctorsOffice[]> {
  return withMockLatency(() => {
    const query = filters.query?.trim().toLowerCase() ?? ""
    const cityById = new Map(citiesSeed.map((city) => [city.id, city]))

    return Object.values(doctorsOfficesSeed)
      .filter((office) => {
        if (filters.cityId && office.cityId !== filters.cityId) {
          return false
        }
        if (
          filters.specializationId
          && office.specializationId !== filters.specializationId
        ) {
          return false
        }

        if (!query) {
          return true
        }

        const cityLabel = cityById.get(office.cityId)?.labels[filters.locale] ?? ""
        const specializationLabel = localizedSpecialty(office, filters.locale)
        const haystack = `${office.name} ${specializationLabel} ${cityLabel}`
        return matchesQuery(haystack, query)
      })
      .map((office) => toDoctorsOffice(office, filters.locale))
  }, { failKey: filters.query })
}

export function resetMockStore(): void {
  conversationsState = structuredClone(conversationsSeed)
  messagesState = structuredClone(messagesByConversation)
  myDoctorIds = new Set<string>(initialMyDoctorIds)
  patientMedicationsState = structuredClone(patientMedicationsSeed)
  appointmentsState = structuredClone(appointmentsSeed)
  prescriptionsState = structuredClone(prescriptionsSeed)
  referralsState = structuredClone(referralsSeed)
}

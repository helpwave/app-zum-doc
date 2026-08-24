import {
  appointmentsSeed,
  buildHomeSummary,
  citiesSeed,
  conversationsSeed,
  doctorsOfficesSeed,
  medicationCatalogSeed,
  messagesByConversation,
  patientMedicationsSeed,
  patientProfileSeed,
  patientProfilesSeed,
  prescriptionsSeed,
  referralsSeed,
  specializationsSeed,
  type DoctorsOfficeSeed,
} from "./data"
import {
  WeekdayUtils,
  type Appointment,
  type AppLocale,
  type ConversationPreview,
  type CreateAppointmentInput,
  type CreatePrescriptionInput,
  type CreateReferralInput,
  type DoctorSearchFilters,
  type DoctorsOffice,
  type DoctorsOfficeOpeningHours,
  type HomeDoctorCard,
  type HomeRequest,
  type HomeSummary,
  type Medication,
  type MedicationCatalogItem,
  type MedicationSize,
  type Message,
  type MessagePreview,
  type PatientProfile,
  type PatientProfileSummary,
  type Prescription,
  type Referral,
  type SearchCity,
  type SearchSpecialization,
  type StructuredCardMessage,
  type TextMessage,
} from "../types"
import {
  formatPatientDateOfBirth,
  patientProfileFullName,
} from "../patientProfile"

const delayMs = 550

let conversationsState: ConversationPreview[] = structuredClone(conversationsSeed)
let messagesState: Record<string, Message[]> = structuredClone(
  messagesByConversation,
)
let myDoctorIds = new Set(
  buildHomeSummary().myDoctors.map((doctor) => doctor.id),
)
let patientMedicationsState: Medication[] = structuredClone(patientMedicationsSeed)
let recentRequestsState: HomeRequest[] = structuredClone(
  buildHomeSummary().recentRequests,
)
let appointmentsState: Appointment[] = structuredClone(appointmentsSeed)
let prescriptionsState: Prescription[] = structuredClone(prescriptionsSeed)
let referralsState: Referral[] = structuredClone(referralsSeed)

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
  return withMockLatency(() => {
    const summary = buildHomeSummary()
    return {
      ...summary,
      myDoctors: [...myDoctorIds].flatMap((id) => {
        const office = doctorsOfficesSeed[id]
        return office ? [toHomeDoctorCard(office, locale)] : []
      }),
      recentRequests: recentRequestsState.map((request) => ({ ...request })),
    }
  })
}

export async function fetchPatientProfile(): Promise<PatientProfile> {
  return withMockLatency(() => ({ ...patientProfileSeed }))
}

export async function fetchPatientProfiles(): Promise<PatientProfileSummary[]> {
  return withMockLatency(() =>
    patientProfilesSeed.map((profile) => ({ ...profile })),
  )
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
    const office = doctorsOfficesSeed[appointment.doctorsOfficeId]
    return {
      ...appointment,
      doctorName: office?.name ?? appointment.doctorName,
      doctorSpecialty: office
        ? localizedSpecialty(office, locale)
        : appointment.doctorSpecialty,
      doctorImageUri: office?.imageUri ?? appointment.doctorImageUri,
      doctorInitials: office?.initials ?? appointment.doctorInitials,
    }
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

    const appointment: Appointment = {
      id: `req-appointment-${Date.now()}`,
      doctorsOfficeId: office.id,
      doctorName: office.name,
      doctorSpecialty: localizedSpecialty(office, locale),
      doctorImageUri: office.imageUri,
      doctorInitials: office.initials,
      profileId: profile.id,
      patientName: patientProfileFullName(profile),
      patientDateOfBirth: formatPatientDateOfBirth(profile.dateOfBirth, locale),
      date: input.date,
      time: input.time,
      isEmergency: input.isEmergency,
      note: input.note,
      status: "requested",
    }
    appointmentsState = [appointment, ...appointmentsState]
    recentRequestsState = [
      {
        id: appointment.id,
        doctorsOfficeId: appointment.doctorsOfficeId,
        doctorName: appointment.doctorName,
        title: appointment.time,
        kind: "appointment",
        kindLabel: "Termin",
        status: "inProgress",
        statusLabel: "Angefragt",
      },
      ...recentRequestsState,
    ]
    return { ...appointment }
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
    const appointment: Appointment = {
      ...existing,
      status: "cancelled",
    }
    appointmentsState = appointmentsState.map((item) =>
      item.id === appointmentId ? appointment : item,
    )
    recentRequestsState = recentRequestsState.map((request) => {
      if (request.id !== appointmentId) {
        return request
      }
      return {
        ...request,
        status: "cancelled",
        statusLabel: "Storniert",
      }
    })
    const office = doctorsOfficesSeed[appointment.doctorsOfficeId]
    return {
      ...appointment,
      doctorSpecialty: office
        ? localizedSpecialty(office, locale)
        : appointment.doctorSpecialty,
    }
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
    const office = doctorsOfficesSeed[prescription.doctorsOfficeId]
    return {
      ...prescription,
      medications: prescription.medications.map((medication) => ({ ...medication })),
      doctorName: office?.name ?? prescription.doctorName,
      doctorSpecialty: office
        ? localizedSpecialty(office, locale)
        : prescription.doctorSpecialty,
      doctorImageUri: office?.imageUri ?? prescription.doctorImageUri,
      doctorInitials: office?.initials ?? prescription.doctorInitials,
    }
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

    const prescription: Prescription = {
      id: `req-prescription-${Date.now()}`,
      doctorsOfficeId: office.id,
      doctorName: office.name,
      doctorSpecialty: localizedSpecialty(office, locale),
      doctorImageUri: office.imageUri,
      doctorInitials: office.initials,
      profileId: profile.id,
      patientName: patientProfileFullName(profile),
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
    recentRequestsState = [
      {
        id: prescription.id,
        doctorsOfficeId: prescription.doctorsOfficeId,
        doctorName: prescription.doctorName,
        title: prescription.medications.map((item) => item.name).join(", "),
        kind: "prescription",
        kindLabel: "Rezept",
        status: "inProgress",
        statusLabel: "In Bearbeitung",
      },
      ...recentRequestsState,
    ]
    return {
      ...prescription,
      medications: prescription.medications.map((medication) => ({ ...medication })),
    }
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
    const prescription: Prescription = {
      ...existing,
      status: "cancelled",
      medications: existing.medications.map((medication) => ({ ...medication })),
    }
    prescriptionsState = prescriptionsState.map((item) =>
      item.id === prescriptionId ? prescription : item,
    )
    recentRequestsState = recentRequestsState.map((request) => {
      if (request.id !== prescriptionId) {
        return request
      }
      return {
        ...request,
        status: "cancelled",
        statusLabel: "Storniert",
      }
    })
    const office = doctorsOfficesSeed[prescription.doctorsOfficeId]
    return {
      ...prescription,
      doctorSpecialty: office
        ? localizedSpecialty(office, locale)
        : prescription.doctorSpecialty,
    }
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
    const office = doctorsOfficesSeed[referral.doctorsOfficeId]
    const specialist = doctorsOfficesSeed[referral.specialistDoctorsOfficeId]
    return {
      ...referral,
      doctorName: office?.name ?? referral.doctorName,
      doctorSpecialty: office
        ? localizedSpecialty(office, locale)
        : referral.doctorSpecialty,
      doctorImageUri: office?.imageUri ?? referral.doctorImageUri,
      doctorInitials: office?.initials ?? referral.doctorInitials,
      specialistName: specialist?.name ?? referral.specialistName,
    }
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

    const referral: Referral = {
      id: `req-referral-${Date.now()}`,
      doctorsOfficeId: office.id,
      doctorName: office.name,
      doctorSpecialty: localizedSpecialty(office, locale),
      doctorImageUri: office.imageUri,
      doctorInitials: office.initials,
      profileId: profile.id,
      patientName: patientProfileFullName(profile),
      specialistDoctorsOfficeId: specialist.id,
      specialistName: specialist.name,
      reason: input.reason,
      status: "inProgress",
    }
    referralsState = [referral, ...referralsState]
    recentRequestsState = [
      {
        id: referral.id,
        doctorsOfficeId: referral.doctorsOfficeId,
        doctorName: referral.doctorName,
        title: referral.specialistName,
        kind: "referral",
        kindLabel: "Überweisung",
        status: "inProgress",
        statusLabel: "In Bearbeitung",
      },
      ...recentRequestsState,
    ]
    return { ...referral }
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
    const referral: Referral = {
      ...existing,
      status: "cancelled",
    }
    referralsState = referralsState.map((item) =>
      item.id === referralId ? referral : item,
    )
    recentRequestsState = recentRequestsState.map((request) => {
      if (request.id !== referralId) {
        return request
      }
      return {
        ...request,
        status: "cancelled",
        statusLabel: "Storniert",
      }
    })
    const office = doctorsOfficesSeed[referral.doctorsOfficeId]
    const specialist = doctorsOfficesSeed[referral.specialistDoctorsOfficeId]
    return {
      ...referral,
      doctorSpecialty: office
        ? localizedSpecialty(office, locale)
        : referral.doctorSpecialty,
      specialistName: specialist?.name ?? referral.specialistName,
    }
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
    office.specialty?.[locale]
    ?? specializationsSeed.find((item) => item.id === office.specializationId)?.labels[locale]
    ?? ""
  )
}

function cloneOpeningHours(
  hours: DoctorsOfficeOpeningHours,
): DoctorsOfficeOpeningHours {
  return WeekdayUtils.array.reduce((next, day) => {
    next[day] = [...(hours[day] ?? [])]
    return next
  }, {} as DoctorsOfficeOpeningHours)
}

function toHomeDoctorCard(
  office: DoctorsOfficeSeed,
  locale: AppLocale,
): HomeDoctorCard {
  return {
    id: office.id,
    name: office.name,
    specialty: localizedSpecialty(office, locale),
    phone: office.phone,
    imageUri: office.imageUri,
    initials: office.initials,
    status: office.status,
  }
}

function toDoctorsOffice(
  office: DoctorsOfficeSeed,
  locale: AppLocale,
): DoctorsOffice {
  return {
    id: office.id,
    name: office.name,
    specialty: localizedSpecialty(office, locale),
    phone: office.phone,
    imageUri: office.imageUri,
    initials: office.initials,
    status: office.status,
    isMyDoctor: myDoctorIds.has(office.id),
    services: (office.services ?? []).map((label) => label[locale]),
    addressLine1: office.addressLine1,
    addressLine2: office.addressLine2,
    websiteLabel: office.websiteLabel,
    websiteUrl: office.websiteUrl,
    additionalOfferLabel: office.additionalOffer?.[locale] ?? "",
    openingHours: cloneOpeningHours(office.openingHours),
  }
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

export async function addMyDoctor(
  doctorsOfficeId: string,
  locale: AppLocale,
): Promise<DoctorsOffice> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    myDoctorIds.add(office.id)
    return toDoctorsOffice(office, locale)
  })
}

export async function removeMyDoctor(
  doctorsOfficeId: string,
  locale: AppLocale,
): Promise<DoctorsOffice> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    myDoctorIds.delete(office.id)
    return toDoctorsOffice(office, locale)
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
): Promise<HomeDoctorCard[]> {
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
      .map((office) => {
        return toHomeDoctorCard(office, filters.locale)
      })
  }, { failKey: filters.query })
}

export function resetMockStore(): void {
  conversationsState = structuredClone(conversationsSeed)
  messagesState = structuredClone(messagesByConversation)
  myDoctorIds = new Set(
    buildHomeSummary().myDoctors.map((doctor) => doctor.id),
  )
  patientMedicationsState = structuredClone(patientMedicationsSeed)
  recentRequestsState = structuredClone(buildHomeSummary().recentRequests)
  appointmentsState = structuredClone(appointmentsSeed)
  prescriptionsState = structuredClone(prescriptionsSeed)
  referralsState = structuredClone(referralsSeed)
}

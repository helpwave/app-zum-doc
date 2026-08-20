import {
  buildHomeSummary,
  citiesSeed,
  conversationsSeed,
  doctorsOfficesSeed,
  medicationCatalogSeed,
  messagesByConversation,
  patientMedicationsSeed,
  patientProfileSeed,
  specializationsSeed,
  type DoctorsOfficeSeed,
} from "./data"
import {
  WeekdayUtils,
  type AppLocale,
  type ChatMessage,
  type Conversation,
  type DoctorSearchFilters,
  type DoctorsOffice,
  type DoctorsOfficeOpeningHours,
  type HomeDoctorCard,
  type HomeSummary,
  type Medication,
  type MedicationCatalogItem,
  type MedicationSize,
  type PatientProfile,
  type SearchCity,
  type SearchSpecialization,
  type StructuredCardMessage,
  type TextMessage,
} from "../types"

const delayMs = 550

let conversationsState: Conversation[] = structuredClone(conversationsSeed)
let messagesState: Record<string, ChatMessage[]> = structuredClone(
  messagesByConversation,
)
let myDoctorIds = new Set(
  buildHomeSummary().myDoctors.map((doctor) => doctor.id),
)
let patientMedicationsState: Medication[] = structuredClone(patientMedicationsSeed)

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

export async function fetchConversations(): Promise<Conversation[]> {
  return withMockLatency(() =>
    conversationsState.map((conversation) => ({ ...conversation })),
  )
}

export async function fetchConversation(
  conversationId: string,
): Promise<Conversation> {
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
): Promise<ChatMessage[]> {
  return withMockLatency(() => {
    const messages = messagesState[conversationId] ?? []
    return messages.map((message) => ({ ...message }))
  })
}

export async function markConversationRead(
  conversationId: string,
): Promise<Conversation[]> {
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
): Promise<ChatMessage[]> {
  return withMockLatency(() => {
    const now = new Date()
    const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const message: TextMessage = {
      id: `msg-local-${Date.now()}`,
      type: "text",
      direction: "outgoing",
      body,
      timeLabel,
      receipt: "sent",
    }

    const existing = messagesState[conversationId] ?? []
    messagesState = {
      ...messagesState,
      [conversationId]: [...existing, message],
    }

    conversationsState = conversationsState.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }
      return {
        ...conversation,
        lastMessage: body,
        timeLabel,
        unreadCount: 0,
        sentByMe: true,
      }
    })

    return (messagesState[conversationId] ?? []).map((item) => ({ ...item }))
  })
}

export async function resolveCardAction(
  conversationId: string,
  messageId: string,
  actionId: string,
): Promise<ChatMessage[]> {
  return withMockLatency(() => {
    const existing = messagesState[conversationId] ?? []
    const next: ChatMessage[] = existing.map((message) => {
      if (message.id !== messageId || message.type !== "card") {
        return message
      }

      const card = message as StructuredCardMessage
      if (actionId === "accept") {
        return {
          ...card,
          status: "confirmed",
          statusLabel: "BESTÄTIGT",
          actions: undefined,
        }
      }

      return {
        ...card,
        status: "declined",
        statusLabel: "ABGELEHNT",
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
    }
  })
}

export async function fetchPatientProfile(): Promise<PatientProfile> {
  return withMockLatency(() => ({ ...patientProfileSeed }))
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
}

import {
  buildHomeSummary,
  citiesSeed,
  conversationsSeed,
  doctorsOfficesSeed,
  messagesByConversation,
  openStatusLabels,
  patientProfileSeed,
  specializationsSeed,
} from "./data"
import type {
  AppLocale,
  ChatMessage,
  Conversation,
  DoctorSearchFilters,
  DoctorsOffice,
  HomeDoctorCard,
  HomeSummary,
  PatientProfile,
  SearchCity,
  SearchSpecialization,
  StructuredCardMessage,
  TextMessage,
} from "../types"

const delayMs = 550

let conversationsState: Conversation[] = structuredClone(conversationsSeed)
let messagesState: Record<string, ChatMessage[]> = structuredClone(
  messagesByConversation,
)

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

export async function fetchConversations(
  search?: string,
): Promise<Conversation[]> {
  return withMockLatency(
    () => {
      const query = search?.trim().toLowerCase() ?? ""
      if (!query || query === "fehler") {
        return conversationsState.map((conversation) => ({ ...conversation }))
      }

      return conversationsState.filter((conversation) => {
        const haystack = `${conversation.contact.name} ${conversation.lastMessage}`.toLowerCase()
        return haystack.includes(query)
      })
    },
    { failKey: search },
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

export async function fetchHomeSummary(): Promise<HomeSummary> {
  return withMockLatency(() => buildHomeSummary())
}

export async function fetchPatientProfile(): Promise<PatientProfile> {
  return withMockLatency(() => ({ ...patientProfileSeed }))
}

export async function fetchDoctorsOffice(
  doctorsOfficeId: string,
): Promise<DoctorsOffice> {
  return withMockLatency(() => {
    const office = doctorsOfficesSeed[doctorsOfficeId]
    if (!office) {
      throw new Error("Arztpraxis nicht gefunden.")
    }
    return {
      id: office.id,
      name: office.name,
      specialty: office.specialty,
      phone: office.phone,
      imageUri: office.imageUri,
      initials: office.initials,
      isOpen: office.isOpen,
      openStatusLabel: office.openStatusLabel,
      addressLine1: office.addressLine1,
      addressLine2: office.addressLine2,
      websiteLabel: office.websiteLabel,
      websiteUrl: office.websiteUrl,
      additionalOfferLabel: office.additionalOfferLabel,
      openingHours: office.openingHours.map((period) => ({
        ...period,
        times: [...period.times],
      })),
    }
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
    const specializationById = new Map(
      specializationsSeed.map((specialization) => [specialization.id, specialization]),
    )

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
        const specializationLabel =
          specializationById.get(office.specializationId)?.labels[filters.locale]
          ?? office.specialty
        const haystack = `${office.name} ${specializationLabel} ${cityLabel}`
        return matchesQuery(haystack, query)
      })
      .map((office) => {
        const specializationLabel =
          specializationById.get(office.specializationId)?.labels[filters.locale]
          ?? office.specialty
        return {
          id: office.id,
          name: office.name,
          specialty: specializationLabel,
          phone: office.phone,
          imageUri: office.imageUri,
          initials: office.initials,
          isOpen: office.isOpen,
          openStatusLabel: office.isOpen
            ? openStatusLabels.open[filters.locale]
            : openStatusLabels.closed[filters.locale],
        }
      })
  }, { failKey: filters.query })
}

export function resetMockStore(): void {
  conversationsState = structuredClone(conversationsSeed)
  messagesState = structuredClone(messagesByConversation)
}

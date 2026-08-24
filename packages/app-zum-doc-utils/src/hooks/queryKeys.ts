export const conversationKeys = {
  all: ["conversations"] as const,
  list: ["conversations", "list"] as const,
  detail: (id: string) => ["conversations", "detail", id] as const,
  messages: (id: string) => ["conversations", "messages", id] as const,
}

export const myDoctorsKeys = {
  all: ["myDoctors"] as const,
}

export const homeKeys = {
  all: ["home"] as const,
  summary: (locale: string) => ["home", "summary", locale] as const,
}

export const profileKeys = {
  all: ["profile"] as const,
  patient: ["profile", "patient"] as const,
  byId: (profileId: string) => ["profile", "detail", profileId] as const,
}

export const doctorsOfficeKeys = {
  all: ["doctorsOffice"] as const,
  detail: (id: string, locale: string) =>
    ["doctorsOffice", "detail", id, locale] as const,
}

export const doctorSearchKeys = {
  all: ["doctorSearch"] as const,
  list: (filters: {
    query?: string
    cityId?: string
    specializationId?: string
    locale: string
  }) =>
    [
      "doctorSearch",
      "list",
      filters.locale,
      filters.query ?? "",
      filters.cityId ?? "",
      filters.specializationId ?? "",
    ] as const,
}

export const cityKeys = {
  all: ["cities"] as const,
  list: (search: string, locale: string) =>
    ["cities", "list", locale, search] as const,
}

export const specializationKeys = {
  all: ["specializations"] as const,
  list: (search: string, locale: string) =>
    ["specializations", "list", locale, search] as const,
}

export const medicationKeys = {
  all: ["medications"] as const,
  patient: ["medications", "patient"] as const,
  search: (search: string) => ["medications", "search", search] as const,
}

export const appointmentKeys = {
  all: ["appointments"] as const,
  detail: (id: string, locale: string) =>
    ["appointments", "detail", id, locale] as const,
}

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
  detail: (id: string, locale: string) =>
    ["prescriptions", "detail", id, locale] as const,
}

export const referralKeys = {
  all: ["referrals"] as const,
  detail: (id: string, locale: string) =>
    ["referrals", "detail", id, locale] as const,
}

export const profileListKeys = {
  all: ["profiles"] as const,
  list: ["profiles", "list"] as const,
}

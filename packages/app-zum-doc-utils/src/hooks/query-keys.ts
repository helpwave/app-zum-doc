export const conversationKeys = {
  all: ["conversations"] as const,
  list: (search?: string) => ["conversations", "list", search ?? ""] as const,
  detail: (id: string) => ["conversations", "detail", id] as const,
  messages: (id: string) => ["conversations", "messages", id] as const,
}

export const homeKeys = {
  all: ["home"] as const,
  summary: ["home", "summary"] as const,
}

export const profileKeys = {
  all: ["profile"] as const,
  patient: ["profile", "patient"] as const,
}

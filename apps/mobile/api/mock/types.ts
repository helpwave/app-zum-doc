export type Presence = "online" | "offline"

export type Contact = {
  id: string
  name: string
  subtitle?: string
  initials?: string
  imageUri?: string | null
  presence: Presence
}

export type Conversation = {
  id: string
  contact: Contact
  lastMessage: string
  timeLabel: string
  unreadCount: number
  sentByMe: boolean
}

export type StructuredCardKind = "appointment" | "prescription" | "referral"

export type StructuredCardStatus = "pending" | "new" | "sent" | "confirmed" | "declined"

export type MessageDirection = "incoming" | "outgoing"

export type TextMessage = {
  id: string
  type: "text"
  direction: MessageDirection
  body: string
  timeLabel: string
  receipt?: "read" | "sent"
}

export type DateDividerMessage = {
  id: string
  type: "date"
  label: string
}

export type SystemMessage = {
  id: string
  type: "system"
  body: string
}

export type StructuredCardMessage = {
  id: string
  type: "card"
  direction: MessageDirection
  kind: StructuredCardKind
  title: string
  subtitle: string
  primary: string
  detail: string
  status: StructuredCardStatus
  statusLabel: string
  actions?: {
    id: string
    label: string
    variant: "primary" | "secondary"
  }[]
}

export type AttachmentMessage = {
  id: string
  type: "attachment"
  direction: MessageDirection
  fileName: string
  fileType: string
  fileSize: string
  timeLabel: string
}

export type ChatMessage =
  | TextMessage
  | DateDividerMessage
  | SystemMessage
  | StructuredCardMessage
  | AttachmentMessage

export type HomeSummary = {
  greeting: string
  patientFirstName: string
  practiceName: string
  practiceLogoUri: string | null
  nextAppointment: {
    title: string
    dateLabel: string
    timeLabel: string
    room: string
    doctorName: string
  } | null
  unreadChatCount: number
  recentConversation: Conversation | null
  quickActions: {
    id: string
    label: string
    href: "/chat" | "/(tabs)/chat" | string
  }[]
}

export type PatientProfile = {
  id: string
  fullName: string
  firstName: string
  dateOfBirth: string
  insuranceNumber: string
  insuranceType: string
  email: string
  phone: string
  practiceName: string
  practiceAddress: string
  notificationsEnabled: boolean
}

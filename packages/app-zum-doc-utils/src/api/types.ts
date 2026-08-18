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
  statusLabel: string,
  timeLabel: string,
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

export type HomeQuickActionId = "prescription" | "appointment" | "referral"

export type HomeQuickAction = {
  id: HomeQuickActionId
  label: string
  href: string
}

export type HomeDoctorCard = {
  id: string
  name: string
  specialty: string
  phone: string
  imageUri: string | null
  initials?: string
  isOpen: boolean
  openStatusLabel: string
}

export type RequestKind = "prescription" | "appointment" | "referral"

export type RequestStatus =
  | "in_progress"
  | "confirmed"
  | "ready_for_pickup"
  | "completed"

export type HomeRequest = {
  id: string
  doctorName: string
  title: string
  kind: RequestKind
  kindLabel: string
  status: RequestStatus
  statusLabel: string
}

export type HomeSummary = {
  quickActions: HomeQuickAction[]
  myDoctors: HomeDoctorCard[]
  recentRequests: HomeRequest[]
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

export type DoctorsOfficeOpeningPeriod = {
  dayLabel: string
  times: string[]
}

export type DoctorsOffice = {
  id: string
  name: string
  specialty: string
  phone: string
  imageUri: string | null
  initials?: string
  isOpen: boolean
  openStatusLabel: string
  openingHours: DoctorsOfficeOpeningPeriod[]
  addressLine1: string
  addressLine2: string
  websiteLabel: string
  websiteUrl: string
  additionalOfferLabel: string
}

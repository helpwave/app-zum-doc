import type {
  ChatMessage,
  Conversation,
  HomeSummary,
  PatientProfile,
} from "../types"

export const conversationsSeed: Conversation[] = [
  {
    id: "conv-sophie",
    contact: {
      id: "contact-sophie",
      name: "Dr. med. Sophie Vogt",
      subtitle: "Hausarztpraxis Altstadt",
      initials: "SV",
      presence: "online",
    },
    lastMessage: "Wir haben die Ergebnisse Ihrer Blut…",
    timeLabel: "09:12",
    unreadCount: 1,
    sentByMe: false,
  },
  {
    id: "conv-altstadt",
    contact: {
      id: "contact-altstadt",
      name: "Hausarztpraxis Altstadt",
      subtitle: "Praxis-Team",
      imageUri: "practice-logo",
      presence: "offline",
    },
    lastMessage: "Ihr Rezept liegt zur Abholung bereit.",
    timeLabel: "Gestern",
    unreadCount: 0,
    sentByMe: true,
  },
  {
    id: "conv-klein",
    contact: {
      id: "contact-klein",
      name: "Zahnarztpraxis Dr. Klein",
      initials: "KL",
      presence: "offline",
    },
    lastMessage: "Bitte kommen Sie 10 Minuten früher.",
    timeLabel: "Mo",
    unreadCount: 0,
    sentByMe: false,
  },
  {
    id: "conv-kern",
    contact: {
      id: "contact-kern",
      name: "Radiologie Dr. Kern",
      initials: "RK",
      presence: "offline",
    },
    lastMessage: "Überweisung erhalten, vielen Dank.",
    timeLabel: "24. Juni",
    unreadCount: 0,
    sentByMe: false,
  },
]

export const messagesByConversation: Record<string, ChatMessage[]> = {
  "conv-sophie": [
    {
      id: "msg-date-1",
      type: "date",
      label: "Heute · 09:10",
    },
    {
      id: "msg-text-1",
      type: "text",
      direction: "incoming",
      body: "Guten Tag Herr Wellermann, wir haben die Ergebnisse Ihrer Blutuntersuchung erhalten und würden die Werte gerne mit Ihnen besprechen.",
      timeLabel: "09:12",
    },
    {
      id: "msg-card-1",
      type: "card",
      direction: "incoming",
      kind: "appointment",
      title: "Terminvorschlag",
      subtitle: "Besprechung Blutwerte · 30 Min",
      primary: "Mi. 8. Juli 2026",
      detail: "15:00 – 15:30 Uhr · Sprechzimmer 2",
      status: "pending",
      statusLabel: "AUSSTEHEND",
      actions: [
        { id: "accept", label: "Zusagen", variant: "primary" },
        { id: "decline", label: "Ablehnen", variant: "secondary" },
      ],
    },
    {
      id: "msg-text-2",
      type: "text",
      direction: "outgoing",
      body: "Vielen Dank. 15:00 Uhr passt mir gut – ich komme vorbei.",
      timeLabel: "09:20",
    },
    {
      id: "msg-att-1",
      type: "attachment",
      direction: "incoming",
      fileName: "Befund_Blutbild.pdf",
      fileType: "PDF",
      fileSize: "196 KB",
      timeLabel: "09:21",
    },
    {
      id: "msg-text-3",
      type: "text",
      direction: "outgoing",
      body: "Perfekt, ich habe den Befund erhalten. Bis Mittwoch!",
      timeLabel: "09:24",
      receipt: "read",
    },
  ],
  "conv-altstadt": [
    {
      id: "msg-alt-date",
      type: "date",
      label: "Gestern · 16:40",
    },
    {
      id: "msg-alt-1",
      type: "text",
      direction: "incoming",
      body: "Ihr Rezept liegt zur Abholung bereit.",
      timeLabel: "16:42",
    },
    {
      id: "msg-alt-2",
      type: "text",
      direction: "outgoing",
      body: "Vielen Dank, ich hole es morgen ab.",
      timeLabel: "16:50",
      receipt: "read",
    },
  ],
  "conv-klein": [
    {
      id: "msg-klein-1",
      type: "text",
      direction: "incoming",
      body: "Bitte kommen Sie 10 Minuten früher.",
      timeLabel: "10:05",
    },
  ],
  "conv-kern": [
    {
      id: "msg-kern-1",
      type: "text",
      direction: "outgoing",
      body: "Überweisung erhalten, vielen Dank.",
      timeLabel: "11:20",
      receipt: "sent",
    },
  ],
}

export const patientProfileSeed: PatientProfile = {
  id: "patient-wellermann",
  fullName: "Jonas Wellermann",
  firstName: "Jonas",
  dateOfBirth: "14.03.1989",
  insuranceNumber: "A123456789",
  insuranceType: "GKV",
  email: "jonas.wellermann@mail.de",
  phone: "+49 170 1234567",
  practiceName: "Hausarztpraxis Altstadt",
  practiceAddress: "Markt 12, 52062 Aachen",
  notificationsEnabled: true,
}

export function buildHomeSummary(
  conversations: Conversation[],
): HomeSummary {
  const unread = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0,
  )
  const recent =
    conversations.find((conversation) => conversation.unreadCount > 0) ??
    conversations[0] ??
    null

  return {
    greeting: "Guten Tag",
    patientFirstName: patientProfileSeed.firstName,
    practiceName: "Hausarztpraxis Altstadt",
    practiceLogoUri: "practice-logo",
    nextAppointment: {
      title: "Besprechung Blutwerte",
      dateLabel: "Mi. 8. Juli 2026",
      timeLabel: "15:00 – 15:30 Uhr",
      room: "Sprechzimmer 2",
      doctorName: "Dr. med. Sophie Vogt",
    },
    unreadChatCount: unread,
    recentConversation: recent,
    quickActions: [
      { id: "message", label: "Nachricht senden", href: "/(tabs)/chat" },
      { id: "prescriptions", label: "Rezepte", href: "/(tabs)/chat" },
      { id: "appointments", label: "Termine", href: "/(tabs)/chat" },
    ],
  }
}

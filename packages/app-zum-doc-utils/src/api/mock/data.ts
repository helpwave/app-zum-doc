import type {
  ChatMessage,
  Conversation,
  DoctorsOffice,
  HomeSummary,
  PatientProfile,
} from "../types"

export type LocalizedLabel = {
  "de-DE": string
  "en-US": string
}

export type DoctorsOfficeSeed = Omit<DoctorsOffice, "isMyDoctor" | "services"> & {
  cityId: string
  specializationId: string
  services?: string[]
}

export const citiesSeed: {
  id: string
  labels: LocalizedLabel
}[] = [
  { id: "berlin", labels: { "de-DE": "Berlin", "en-US": "Berlin" } },
  { id: "bielefeld", labels: { "de-DE": "Bielefeld", "en-US": "Bielefeld" } },
  { id: "bochum", labels: { "de-DE": "Bochum", "en-US": "Bochum" } },
  { id: "aachen", labels: { "de-DE": "Aachen", "en-US": "Aachen" } },
  { id: "nordberg", labels: { "de-DE": "Nordberg", "en-US": "Nordberg" } },
  { id: "hamburg", labels: { "de-DE": "Hamburg", "en-US": "Hamburg" } },
  { id: "koeln", labels: { "de-DE": "Köln", "en-US": "Cologne" } },
]

export const specializationsSeed: {
  id: string
  labels: LocalizedLabel
}[] = [
  { id: "general-medicine", labels: { "de-DE": "Allgemeinmedizin", "en-US": "General medicine" } },
  { id: "internal-medicine", labels: { "de-DE": "Innere Medizin", "en-US": "Internal medicine" } },
  { id: "cardiology", labels: { "de-DE": "Kardiologie", "en-US": "Cardiology" } },
  { id: "dentistry", labels: { "de-DE": "Zahnmedizin", "en-US": "Dentistry" } },
  { id: "radiology", labels: { "de-DE": "Radiologie", "en-US": "Radiology" } },
]

export const openStatusLabels: {
  open: LocalizedLabel
  closed: LocalizedLabel
} = {
  open: { "de-DE": "Praxis ist geöffnet", "en-US": "Practice is open" },
  closed: { "de-DE": "Praxis ist geschlossen", "en-US": "Practice is closed" },
}

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

export const doctorsOfficesSeed: Record<string, DoctorsOfficeSeed> = {
  "office-moser": {
    id: "office-moser",
    name: "Dr. Moser",
    specialty: "Allgemeinmedizin - Innere Medizin",
    phone: "040 3187612001",
    imageUri: "doctor-portrait",
    isOpen: true,
    openStatusLabel: "Praxis ist geöffnet",
    openingHours: [
      { dayLabel: "Montag", times: ["7:00 - 16:00"] },
      { dayLabel: "Dienstag", times: ["7:00 - 12:00", "14:00 - 16:00"] },
      { dayLabel: "Mittwoch", times: ["7:00 - 12:00"] },
      { dayLabel: "Donnerstag", times: ["7:00 - 16:00"] },
      { dayLabel: "Freitag", times: ["7:00 - 12:00"] },
      { dayLabel: "Samstag", times: [] },
      { dayLabel: "Sonntag", times: [] },
    ],
    addressLine1: "Teichweg 12",
    addressLine2: "22637 Nordberg",
    websiteLabel: "www.dr-moser.de",
    websiteUrl: "https://www.dr-moser.de",
    additionalOfferLabel: "Online-Termin für Impfungen",
    services: ["Impfungen", "Vorsorgeuntersuchung", "DMP"],
    cityId: "nordberg",
    specializationId: "internal-medicine",
  },
  "office-haumann": {
    id: "office-haumann",
    name: "Dr. Haumann",
    specialty: "Allgemeinmedizin",
    phone: "0241 5566 730",
    imageUri: null,
    initials: "HM",
    isOpen: false,
    openStatusLabel: "Praxis ist geschlossen",
    openingHours: [
      { dayLabel: "Montag", times: ["8:00 - 12:00"] },
      { dayLabel: "Dienstag", times: ["8:00 - 12:00"] },
      { dayLabel: "Mittwoch", times: [] },
      { dayLabel: "Donnerstag", times: ["8:00 - 12:00", "14:00 - 17:00"] },
      { dayLabel: "Freitag", times: ["8:00 - 12:00"] },
      { dayLabel: "Samstag", times: [] },
      { dayLabel: "Sonntag", times: [] },
    ],
    addressLine1: "Pontstraße 55",
    addressLine2: "52062 Aachen",
    websiteLabel: "www.dr-haumann.de",
    websiteUrl: "https://www.dr-haumann.de",
    additionalOfferLabel: "Videosprechstunde",
    services: ["Hausbesuche", "Videosprechstunde"],
    cityId: "aachen",
    specializationId: "general-medicine",
  },
  "office-vogt": {
    id: "office-vogt",
    name: "Dr. med. Sophie Vogt",
    specialty: "Kardiologie",
    phone: "030 88776611",
    imageUri: "doctor-portrait",
    initials: "SV",
    isOpen: true,
    openStatusLabel: "Praxis ist geöffnet",
    openingHours: [
      { dayLabel: "Montag", times: ["8:00 - 16:00"] },
      { dayLabel: "Dienstag", times: ["8:00 - 16:00"] },
      { dayLabel: "Mittwoch", times: ["8:00 - 12:00"] },
      { dayLabel: "Donnerstag", times: ["8:00 - 16:00"] },
      { dayLabel: "Freitag", times: ["8:00 - 12:00"] },
      { dayLabel: "Samstag", times: [] },
      { dayLabel: "Sonntag", times: [] },
    ],
    addressLine1: "Friedrichstraße 88",
    addressLine2: "10117 Berlin",
    websiteLabel: "www.kardiologie-vogt.de",
    websiteUrl: "https://www.kardiologie-vogt.de",
    additionalOfferLabel: "Belastungs-EKG",
    cityId: "berlin",
    specializationId: "cardiology",
  },
  "office-klein": {
    id: "office-klein",
    name: "Zahnarztpraxis Dr. Klein",
    specialty: "Zahnmedizin",
    phone: "0521 334455",
    imageUri: "practice-logo",
    initials: "KL",
    isOpen: true,
    openStatusLabel: "Praxis ist geöffnet",
    openingHours: [
      { dayLabel: "Montag", times: ["9:00 - 17:00"] },
      { dayLabel: "Dienstag", times: ["9:00 - 17:00"] },
      { dayLabel: "Mittwoch", times: ["9:00 - 13:00"] },
      { dayLabel: "Donnerstag", times: ["9:00 - 17:00"] },
      { dayLabel: "Freitag", times: ["9:00 - 13:00"] },
      { dayLabel: "Samstag", times: [] },
      { dayLabel: "Sonntag", times: [] },
    ],
    addressLine1: "Jahnplatz 4",
    addressLine2: "33602 Bielefeld",
    websiteLabel: "www.zahnarzt-klein.de",
    websiteUrl: "https://www.zahnarzt-klein.de",
    additionalOfferLabel: "Professionelle Zahnreinigung",
    cityId: "bielefeld",
    specializationId: "dentistry",
  },
  "office-kern": {
    id: "office-kern",
    name: "Radiologie Dr. Kern",
    specialty: "Radiologie",
    phone: "0234 998877",
    imageUri: "practice-logo",
    initials: "RK",
    isOpen: false,
    openStatusLabel: "Praxis ist geschlossen",
    openingHours: [
      { dayLabel: "Montag", times: ["7:30 - 15:30"] },
      { dayLabel: "Dienstag", times: ["7:30 - 15:30"] },
      { dayLabel: "Mittwoch", times: ["7:30 - 15:30"] },
      { dayLabel: "Donnerstag", times: ["7:30 - 15:30"] },
      { dayLabel: "Freitag", times: ["7:30 - 12:00"] },
      { dayLabel: "Samstag", times: [] },
      { dayLabel: "Sonntag", times: [] },
    ],
    addressLine1: "Kortumstraße 19",
    addressLine2: "44787 Bochum",
    websiteLabel: "www.radiologie-kern.de",
    websiteUrl: "https://www.radiologie-kern.de",
    additionalOfferLabel: "MRT ohne Wartezeit",
    cityId: "bochum",
    specializationId: "radiology",
  },
  "office-altstadt": {
    id: "office-altstadt",
    name: "Hausarztpraxis Altstadt",
    specialty: "Allgemeinmedizin",
    phone: "0241 112233",
    imageUri: "practice-logo",
    initials: "HA",
    isOpen: true,
    openStatusLabel: "Praxis ist geöffnet",
    openingHours: [
      { dayLabel: "Montag", times: ["8:00 - 18:00"] },
      { dayLabel: "Dienstag", times: ["8:00 - 18:00"] },
      { dayLabel: "Mittwoch", times: ["8:00 - 13:00"] },
      { dayLabel: "Donnerstag", times: ["8:00 - 18:00"] },
      { dayLabel: "Freitag", times: ["8:00 - 13:00"] },
      { dayLabel: "Samstag", times: [] },
      { dayLabel: "Sonntag", times: [] },
    ],
    addressLine1: "Markt 12",
    addressLine2: "52062 Aachen",
    websiteLabel: "www.hausarzt-altstadt.de",
    websiteUrl: "https://www.hausarzt-altstadt.de",
    additionalOfferLabel: "Hausbesuche",
    cityId: "aachen",
    specializationId: "general-medicine",
  },
}

export function buildHomeSummary(): HomeSummary {
  const moser = doctorsOfficesSeed["office-moser"]
  const haumann = doctorsOfficesSeed["office-haumann"]

  return {
    quickActions: [
      {
        id: "prescription",
        label: "Rezept",
        href: "/requests/prescription",
      },
      {
        id: "appointment",
        label: "Termin",
        href: "/requests/appointment",
      },
      {
        id: "referral",
        label: "Überweisung",
        href: "/requests/referral",
      },
    ],
    myDoctors: [
      {
        id: moser.id,
        name: moser.name,
        specialty: moser.specialty,
        phone: moser.phone,
        imageUri: moser.imageUri,
        isOpen: moser.isOpen,
        openStatusLabel: moser.openStatusLabel,
      },
      {
        id: haumann.id,
        name: haumann.name,
        specialty: haumann.specialty,
        phone: haumann.phone,
        imageUri: haumann.imageUri,
        initials: haumann.initials,
        isOpen: haumann.isOpen,
        openStatusLabel: haumann.openStatusLabel,
      },
    ],
    recentRequests: [
      {
        id: "req-aciclovir",
        doctorName: "Dr. Moser",
        title: "Aciclovir 800 Heumann",
        kind: "prescription",
        kindLabel: "Rezept",
        status: "in_progress",
        statusLabel: "In Bearbeitung",
      },
      {
        id: "req-radiologie",
        doctorName: "Dr. Moser",
        title: "Radiologie Dr. Kern",
        kind: "referral",
        kindLabel: "Überweisung",
        status: "ready_for_pickup",
        statusLabel: "Abholbereit",
      },
    ],
  }
}

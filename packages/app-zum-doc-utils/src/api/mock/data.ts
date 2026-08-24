import type {
  Appointment,
  ConversationPreview,
  DoctorsOffice,
  DoctorsOfficeOpeningHours,
  HomeSummary,
  Medication,
  MedicationCatalogItem,
  Message,
  PatientProfile,
  PatientProfileSummary,
  Prescription,
  Referral,
} from "../types"
import {
  formatPatientDateOfBirth,
  patientProfileFullName,
  toPatientProfileSummary,
} from "../patientProfile"

function chatTime(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): Date {
  return new Date(year, month - 1, day, hours, minutes)
}

export type LocalizedLabel = {
  "de-DE": string
  "en-US": string
}

export type DoctorsOfficeSeed = Omit<
  DoctorsOffice,
  "isMyDoctor" | "specialty" | "services" | "additionalOfferLabel"
> & {
  cityId: string
  specializationId: string
  specialty?: LocalizedLabel
  services?: LocalizedLabel[]
  additionalOffer?: LocalizedLabel
}

function openingHours(
  hours: Partial<DoctorsOfficeOpeningHours>,
): DoctorsOfficeOpeningHours {
  return {
    monday: hours.monday ?? [],
    tuesday: hours.tuesday ?? [],
    wednesday: hours.wednesday ?? [],
    thursday: hours.thursday ?? [],
    friday: hours.friday ?? [],
    saturday: hours.saturday ?? [],
    sunday: hours.sunday ?? [],
  }
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
  { id: "orthopedics", labels: { "de-DE": "Orthopädie", "en-US": "Orthopedics" } },
]

export const conversationsSeed: ConversationPreview[] = [
  {
    id: "conv-sophie",
    user: {
      id: "user-sophie",
      name: "Dr. med. Sophie Vogt",
      status: "online",
    },
    lastMessage: {
      id: "msg-text-1",
      preview: "Wir haben die Ergebnisse Ihrer Blut…",
      time: chatTime(2026, 7, 8, 9, 12),
      direction: "incoming",
      status: "received",
    },
    unreadCount: 1,
  },
  {
    id: "conv-altstadt",
    user: {
      id: "user-altstadt",
      name: "Hausarztpraxis Altstadt",
      imageUri: "practice-logo",
      status: "offline",
    },
    lastMessage: {
      id: "msg-alt-2",
      preview: "Vielen Dank, ich hole es morgen ab.",
      time: chatTime(2026, 7, 7, 16, 50),
      direction: "outgoing",
      status: "read",
    },
    unreadCount: 0,
  },
  {
    id: "conv-klein",
    user: {
      id: "user-klein",
      name: "Zahnarztpraxis Dr. Klein",
      status: "offline",
    },
    lastMessage: {
      id: "msg-klein-1",
      preview: "Bitte kommen Sie 10 Minuten früher.",
      time: chatTime(2026, 7, 7, 10, 5),
      direction: "incoming",
      status: "received",
    },
    unreadCount: 0,
  },
  {
    id: "conv-kern",
    user: {
      id: "user-kern",
      name: "Radiologie Dr. Kern",
      status: "offline",
    },
    lastMessage: {
      id: "msg-kern-1",
      preview: "Überweisung erhalten, vielen Dank.",
      time: chatTime(2026, 6, 24, 11, 20),
      direction: "outgoing",
      status: "sent",
    },
    unreadCount: 0,
  },
]

export const messagesByConversation: Record<string, Message[]> = {
  "conv-sophie": [
    {
      id: "msg-date-1",
      type: "date",
      date: chatTime(2026, 7, 8, 9, 10),
    },
    {
      id: "msg-text-1",
      type: "text",
      direction: "incoming",
      status: "received",
      body: "Guten Tag Herr Wellermann, wir haben die Ergebnisse Ihrer Blutuntersuchung erhalten und würden die Werte gerne mit Ihnen besprechen.",
      time: chatTime(2026, 7, 8, 9, 12),
    },
    {
      id: "msg-card-1",
      type: "card",
      direction: "incoming",
      status: "received",
      kind: "appointment",
      title: "Terminvorschlag",
      subtitle: "Besprechung Blutwerte · 30 Min",
      primary: "Mi. 8. Juli 2026",
      detail: "15:00 – 15:30 Uhr · Sprechzimmer 2",
      mainActionId: "accept",
      time: chatTime(2026, 7, 8, 9, 15),
      actions: [
        { id: "accept", label: "Zusagen" },
        { id: "decline", label: "Ablehnen" },
      ],
    },
    {
      id: "msg-text-2",
      type: "text",
      direction: "outgoing",
      status: "sent",
      body: "Vielen Dank. 15:00 Uhr passt mir gut – ich komme vorbei.",
      time: chatTime(2026, 7, 8, 9, 20),
    },
    {
      id: "msg-att-1",
      type: "attachment",
      direction: "incoming",
      status: "received",
      fileName: "Befund_Blutbild.pdf",
      fileType: "PDF",
      fileSize: "196 KB",
      time: chatTime(2026, 7, 8, 9, 21),
    },
    {
      id: "msg-text-3",
      type: "text",
      direction: "outgoing",
      status: "read",
      body: "Perfekt, ich habe den Befund erhalten. Bis Mittwoch!",
      time: chatTime(2026, 7, 8, 9, 24),
    },
  ],
  "conv-altstadt": [
    {
      id: "msg-alt-date",
      type: "date",
      date: chatTime(2026, 7, 7, 16, 40),
    },
    {
      id: "msg-alt-1",
      type: "text",
      direction: "incoming",
      status: "received",
      body: "Ihr Rezept liegt zur Abholung bereit.",
      time: chatTime(2026, 7, 7, 16, 42),
    },
    {
      id: "msg-alt-2",
      type: "text",
      direction: "outgoing",
      status: "read",
      body: "Vielen Dank, ich hole es morgen ab.",
      time: chatTime(2026, 7, 7, 16, 50),
    },
  ],
  "conv-klein": [
    {
      id: "msg-klein-1",
      type: "text",
      direction: "incoming",
      status: "received",
      body: "Bitte kommen Sie 10 Minuten früher.",
      time: chatTime(2026, 7, 7, 10, 5),
    },
  ],
  "conv-kern": [
    {
      id: "msg-kern-1",
      type: "text",
      direction: "outgoing",
      status: "sent",
      body: "Überweisung erhalten, vielen Dank.",
      time: chatTime(2026, 6, 24, 11, 20),
    },
  ],
}

export const medicationCatalogSeed: MedicationCatalogItem[] = [
  { id: "catalog-paracetamol", name: "Paracetamol" },
  { id: "catalog-ibuprofen", name: "Ibuprofen" },
  { id: "catalog-aspirin", name: "Aspirin" },
  { id: "catalog-amoxicillin", name: "Amoxicillin" },
  { id: "catalog-cetirizine", name: "Cetirizine" },
  { id: "catalog-zip-kompresse", name: "1-KAM Zip-Kompresse" },
  { id: "catalog-metformin", name: "Metformin" },
  { id: "catalog-omeprazole", name: "Omeprazole" },
  { id: "catalog-ramipril", name: "Ramipril" },
  { id: "catalog-simvastatin", name: "Simvastatin" },
  { id: "catalog-levothyroxine", name: "Levothyroxine" },
  { id: "catalog-salbutamol", name: "Salbutamol" },
]

export const patientMedicationsSeed: Medication[] = [
  { id: "med-paracetamol", name: "Paracetamol", size: "n1" },
  { id: "med-zip-kompresse", name: "1-KAM Zip-Kompresse", size: "n2" },
  { id: "med-ibuprofen", name: "Ibuprofen", size: "n2" },
  { id: "med-aspirin", name: "Aspirin", size: "n1" },
  { id: "med-amoxicillin", name: "Amoxicillin", size: "n2" },
  { id: "med-cetirizine", name: "Cetirizine", size: "n3" },
]

export const patientProfileSeed: PatientProfile = {
  id: "patient-wellermann",
  firstName: "Jonas",
  lastName: "Wellermann",
  dateOfBirth: new Date(1989, 2, 14),
  email: "jonas.wellermann@mail.de",
  phone: "+49 170 1234567",
  insurance: {
    insuranceProviderId: "techniker-krankenkasse",
    insuranceNumber: "A123456789",
  },
  medicationList: patientMedicationsSeed,
}

export const doctorsOfficesSeed: Record<string, DoctorsOfficeSeed> = {
  "office-moser": {
    id: "office-moser",
    name: "Dr. Moser",
    phone: "040 3187612001",
    imageUri: "doctor-portrait",
    status: "open",
    openingHours: openingHours({
      monday: ["7:00 - 16:00"],
      tuesday: ["7:00 - 12:00", "14:00 - 16:00"],
      wednesday: ["7:00 - 12:00"],
      thursday: ["7:00 - 16:00"],
      friday: ["7:00 - 12:00"],
    }),
    addressLine1: "Teichweg 12",
    addressLine2: "22637 Nordberg",
    websiteLabel: "www.dr-moser.de",
    websiteUrl: "https://www.dr-moser.de",
    specialty: {
      "de-DE": "Allgemeinmedizin - Innere Medizin",
      "en-US": "General medicine - Internal medicine",
    },
    additionalOffer: {
      "de-DE": "Online-Termin für Impfungen",
      "en-US": "Online appointment for vaccinations",
    },
    services: [
      { "de-DE": "Impfungen", "en-US": "Vaccinations" },
      { "de-DE": "Vorsorgeuntersuchung", "en-US": "Preventive checkup" },
      { "de-DE": "DMP", "en-US": "DMP" },
    ],
    cityId: "nordberg",
    specializationId: "internal-medicine",
  },
  "office-haumann": {
    id: "office-haumann",
    name: "Dr. Haumann",
    phone: "0241 5566 730",
    imageUri: null,
    initials: "HM",
    status: "closed",
    openingHours: openingHours({
      monday: ["8:00 - 12:00"],
      tuesday: ["8:00 - 12:00"],
      thursday: ["8:00 - 12:00", "14:00 - 17:00"],
      friday: ["8:00 - 12:00"],
    }),
    addressLine1: "Pontstraße 55",
    addressLine2: "52062 Aachen",
    websiteLabel: "www.dr-haumann.de",
    websiteUrl: "https://www.dr-haumann.de",
    additionalOffer: {
      "de-DE": "Videosprechstunde",
      "en-US": "Video consultation",
    },
    services: [
      { "de-DE": "Hausbesuche", "en-US": "Home visits" },
      { "de-DE": "Videosprechstunde", "en-US": "Video consultation" },
    ],
    cityId: "aachen",
    specializationId: "general-medicine",
  },
  "office-vogt": {
    id: "office-vogt",
    name: "Dr. med. Sophie Vogt",
    phone: "030 88776611",
    imageUri: "doctor-portrait",
    initials: "SV",
    status: "open",
    openingHours: openingHours({
      monday: ["8:00 - 16:00"],
      tuesday: ["8:00 - 16:00"],
      wednesday: ["8:00 - 12:00"],
      thursday: ["8:00 - 16:00"],
      friday: ["8:00 - 12:00"],
    }),
    addressLine1: "Friedrichstraße 88",
    addressLine2: "10117 Berlin",
    websiteLabel: "www.kardiologie-vogt.de",
    websiteUrl: "https://www.kardiologie-vogt.de",
    additionalOffer: {
      "de-DE": "Belastungs-EKG",
      "en-US": "Stress ECG",
    },
    cityId: "berlin",
    specializationId: "cardiology",
  },
  "office-klein": {
    id: "office-klein",
    name: "Zahnarztpraxis Dr. Klein",
    phone: "0521 334455",
    imageUri: "practice-logo",
    initials: "KL",
    status: "open",
    openingHours: openingHours({
      monday: ["9:00 - 17:00"],
      tuesday: ["9:00 - 17:00"],
      wednesday: ["9:00 - 13:00"],
      thursday: ["9:00 - 17:00"],
      friday: ["9:00 - 13:00"],
    }),
    addressLine1: "Jahnplatz 4",
    addressLine2: "33602 Bielefeld",
    websiteLabel: "www.zahnarzt-klein.de",
    websiteUrl: "https://www.zahnarzt-klein.de",
    additionalOffer: {
      "de-DE": "Professionelle Zahnreinigung",
      "en-US": "Professional dental cleaning",
    },
    cityId: "bielefeld",
    specializationId: "dentistry",
  },
  "office-kern": {
    id: "office-kern",
    name: "Radiologie Dr. Kern",
    phone: "0234 998877",
    imageUri: "practice-logo",
    initials: "RK",
    status: "closed",
    openingHours: openingHours({
      monday: ["7:30 - 15:30"],
      tuesday: ["7:30 - 15:30"],
      wednesday: ["7:30 - 15:30"],
      thursday: ["7:30 - 15:30"],
      friday: ["7:30 - 12:00"],
    }),
    addressLine1: "Kortumstraße 19",
    addressLine2: "44787 Bochum",
    websiteLabel: "www.radiologie-kern.de",
    websiteUrl: "https://www.radiologie-kern.de",
    additionalOffer: {
      "de-DE": "MRT ohne Wartezeit",
      "en-US": "MRI without waiting",
    },
    cityId: "bochum",
    specializationId: "radiology",
  },
  "office-altstadt": {
    id: "office-altstadt",
    name: "Hausarztpraxis Altstadt",
    phone: "0241 112233",
    imageUri: "practice-logo",
    initials: "HA",
    status: "open",
    openingHours: openingHours({
      monday: ["8:00 - 18:00"],
      tuesday: ["8:00 - 18:00"],
      wednesday: ["8:00 - 13:00"],
      thursday: ["8:00 - 18:00"],
      friday: ["8:00 - 13:00"],
    }),
    addressLine1: "Markt 12",
    addressLine2: "52062 Aachen",
    websiteLabel: "www.hausarzt-altstadt.de",
    websiteUrl: "https://www.hausarzt-altstadt.de",
    additionalOffer: {
      "de-DE": "Hausbesuche",
      "en-US": "Home visits",
    },
    cityId: "aachen",
    specializationId: "general-medicine",
  },
  "office-willendorfer": {
    id: "office-willendorfer",
    name: "Dr. Anton Willendorfer",
    phone: "040 44556677",
    imageUri: null,
    initials: "AW",
    status: "open",
    openingHours: openingHours({
      monday: ["8:00 - 16:00"],
      tuesday: ["8:00 - 16:00"],
      wednesday: ["8:00 - 12:00"],
      thursday: ["8:00 - 16:00"],
      friday: ["8:00 - 12:00"],
    }),
    addressLine1: "Alsterweg 8",
    addressLine2: "22637 Nordberg",
    websiteLabel: "www.ortho-willendorfer.de",
    websiteUrl: "https://www.ortho-willendorfer.de",
    specialty: {
      "de-DE": "Orthopädie",
      "en-US": "Orthopedics",
    },
    additionalOffer: {
      "de-DE": "Rückensprechstunde",
      "en-US": "Back consultation",
    },
    cityId: "nordberg",
    specializationId: "orthopedics",
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
        href: "/requests/prescription/create",
      },
      {
        id: "appointment",
        label: "Termin",
        href: "/requests/appointment/create",
      },
      {
        id: "referral",
        label: "Überweisung",
        href: "/requests/referral/create",
      },
    ],
    myDoctors: [
      {
        id: moser.id,
        name: moser.name,
        specialty: moser.specialty?.["de-DE"] ?? "",
        phone: moser.phone,
        imageUri: moser.imageUri,
        status: moser.status,
      },
      {
        id: haumann.id,
        name: haumann.name,
        specialty: haumann.specialty?.["de-DE"] ?? "",
        phone: haumann.phone,
        imageUri: haumann.imageUri,
        initials: haumann.initials,
        status: haumann.status,
      },
    ],
    recentRequests: [
      {
        id: "req-limptar",
        doctorsOfficeId: moser.id,
        doctorName: moser.name,
        title: "Limptar N Filmtabletten, 80 St",
        kind: "prescription",
        kindLabel: "Rezept",
        status: "inProgress",
        statusLabel: "In Bearbeitung",
      },
      {
        id: "req-aciclovir",
        doctorsOfficeId: moser.id,
        doctorName: moser.name,
        title: "Aciclovir 800 Heumann",
        kind: "prescription",
        kindLabel: "Rezept",
        status: "inProgress",
        statusLabel: "In Bearbeitung",
      },
      {
        id: "req-floxal",
        doctorsOfficeId: moser.id,
        doctorName: moser.name,
        title: "Floxal EDO 3 mg/ml Augentropfen",
        kind: "prescription",
        kindLabel: "Rezept",
        status: "readyForPickup",
        statusLabel: "Abholbereit",
      },
      {
        id: "req-radiologie",
        doctorsOfficeId: moser.id,
        doctorName: moser.name,
        title: "Dr. Anton Willendorfer",
        kind: "referral",
        kindLabel: "Überweisung",
        status: "inProgress",
        statusLabel: "In Bearbeitung",
      },
      {
        id: "req-checkup",
        doctorsOfficeId: moser.id,
        doctorName: moser.name,
        title: "Vorsorgeuntersuchung",
        kind: "appointment",
        kindLabel: "Termin",
        status: "inProgress",
        statusLabel: "Angefragt",
      },
      {
        id: "req-haumann-vaccine",
        doctorsOfficeId: haumann.id,
        doctorName: haumann.name,
        title: "Grippeimpfung",
        kind: "appointment",
        kindLabel: "Termin",
        status: "confirmed",
        statusLabel: "Bestätigt",
      },
    ],
  }
}

export const patientProfilesSeed: PatientProfileSummary[] = [
  toPatientProfileSummary(patientProfileSeed),
]

export const appointmentsSeed: Appointment[] = [
  {
    id: "req-checkup",
    doctorsOfficeId: "office-moser",
    doctorName: "Dr. Moser",
    doctorSpecialty: "Allgemeinmedizin - Innere Medizin",
    doctorImageUri: "doctor-portrait",
    profileId: patientProfileSeed.id,
    patientName: patientProfileFullName(patientProfileSeed),
    patientDateOfBirth: formatPatientDateOfBirth(patientProfileSeed.dateOfBirth, "de-DE"),
    date: "2025-06-22",
    time: "14:00",
    isEmergency: false,
    note: "",
    sickNote: "Arbeitgeber",
    status: "requested",
  },
  {
    id: "req-haumann-vaccine",
    doctorsOfficeId: "office-haumann",
    doctorName: "Dr. Haumann",
    doctorSpecialty: "Allgemeinmedizin",
    doctorImageUri: null,
    doctorInitials: "HM",
    profileId: patientProfileSeed.id,
    patientName: patientProfileFullName(patientProfileSeed),
    patientDateOfBirth: formatPatientDateOfBirth(patientProfileSeed.dateOfBirth, "de-DE"),
    date: "2025-06-21",
    time: "10:00",
    isEmergency: false,
    note: "",
    status: "confirmed",
  },
]

export const prescriptionsSeed: Prescription[] = [
  {
    id: "req-limptar",
    doctorsOfficeId: "office-moser",
    doctorName: "Dr. Moser",
    doctorSpecialty: "Allgemeinmedizin - Innere Medizin",
    doctorImageUri: "doctor-portrait",
    profileId: patientProfileSeed.id,
    patientName: patientProfileFullName(patientProfileSeed),
    shipByMail: true,
    note: "Wenn möglich bitte zwei kleine Packungen Paracetamol. Vielen Dank und lieben Gruß.",
    medications: [
      { id: "rx-med-paracetamol", name: "Paracetamol", size: "n2" },
      { id: "rx-med-zip", name: "1-KAM Zip-Kompresse", size: "n1" },
    ],
    status: "inProgress",
  },
  {
    id: "req-aciclovir",
    doctorsOfficeId: "office-moser",
    doctorName: "Dr. Moser",
    doctorSpecialty: "Allgemeinmedizin - Innere Medizin",
    doctorImageUri: "doctor-portrait",
    profileId: patientProfileSeed.id,
    patientName: patientProfileFullName(patientProfileSeed),
    shipByMail: false,
    note: "",
    medications: [
      { id: "rx-med-aciclovir", name: "Amoxicillin", size: "n1" },
    ],
    status: "inProgress",
  },
  {
    id: "req-floxal",
    doctorsOfficeId: "office-moser",
    doctorName: "Dr. Moser",
    doctorSpecialty: "Allgemeinmedizin - Innere Medizin",
    doctorImageUri: "doctor-portrait",
    profileId: patientProfileSeed.id,
    patientName: patientProfileFullName(patientProfileSeed),
    shipByMail: true,
    note: "",
    medications: [
      { id: "rx-med-floxal", name: "Ibuprofen", size: "n3" },
    ],
    status: "readyForPickup",
  },
]

export const referralsSeed: Referral[] = [
  {
    id: "req-radiologie",
    doctorsOfficeId: "office-moser",
    doctorName: "Dr. Moser",
    doctorSpecialty: "Allgemeinmedizin - Innere Medizin",
    doctorImageUri: "doctor-portrait",
    profileId: patientProfileSeed.id,
    patientName: patientProfileFullName(patientProfileSeed),
    specialistDoctorsOfficeId: "office-willendorfer",
    specialistName: "Dr. Anton Willendorfer",
    reason:
      "Anhaltendes Unwohlsein und starke Schmerzen im unteren Rücken.",
    status: "inProgress",
  },
]

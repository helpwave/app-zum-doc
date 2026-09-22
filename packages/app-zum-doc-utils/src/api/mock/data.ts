import type {
  Address,
  AppointmentRecord,
  ConversationPreview,
  DoctorsOffice,
  DoctorsOfficeEmailNotifications,
  DoctorsOfficeOpeningHours,
  DoctorsOfficeOnlineServices,
  Medication,
  MedicationCatalogItem,
  Message,
  PatientProfile,
  PatientProfileSummary,
  PrescriptionRecord,
  ReferralRecord
} from '../types'
import { toPatientProfileSummary } from '../patientProfile'

export const initialMyDoctorIds = ['office-moser', 'office-haumann'] as const

function chatTime(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number
): Date {
  return new Date(year, month - 1, day, hours, minutes)
}

export type LocalizedLabel = {
  'de-DE': string,
  'en-US': string,
}

export type LocalizedTemporaryNotificationTile = {
  enabled?: boolean,
  title?: LocalizedLabel,
  description?: LocalizedLabel,
}

export type LocalizedTemporaryNotifications = {
  profile?: LocalizedTemporaryNotificationTile,
  appointments?: LocalizedTemporaryNotificationTile,
  prescriptions?: LocalizedTemporaryNotificationTile,
  referrals?: LocalizedTemporaryNotificationTile,
}

export type LocalizedDoctorServiceSeed = {
  id: string,
  name: LocalizedLabel,
  description?: LocalizedLabel,
  url?: string,
}

export type LocalizedDoctorSeed = {
  id: string,
  name: LocalizedLabel,
  imageUri?: string,
}

export type DoctorsOfficeSeed = Omit<
  DoctorsOffice,
  | 'specialization'
  | 'specializationIds'
  | 'services'
  | 'offers'
  | 'doctors'
  | 'onlineServices'
  | 'emailNotifications'
  | 'temporaryNotifications'
  | 'openingHoursNote'
> & {
  cityId: string,
  specializationId: string,
  specializationIds?: string[],
  specialization?: LocalizedLabel,
  onlineServices?: DoctorsOfficeOnlineServices,
  emailNotifications?: DoctorsOfficeEmailNotifications,
  temporaryNotifications?: LocalizedTemporaryNotifications,
  openingHoursNote?: LocalizedLabel,
  services?: LocalizedDoctorServiceSeed[],
  offers?: LocalizedDoctorServiceSeed[],
  doctors?: LocalizedDoctorSeed[],
}

function address(
  street: string,
  streetNumber: number,
  postalCode: string,
  city: string,
  province?: string
): Address {
  return {
    country: 'Deutschland',
    province,
    city,
    postalCode,
    street,
    streetNumber,
  }
}

function openingHours(
  hours: Partial<DoctorsOfficeOpeningHours>
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
  id: string,
  labels: LocalizedLabel,
}[] = [
  { id: 'berlin', labels: { 'de-DE': 'Berlin', 'en-US': 'Berlin' } },
  { id: 'bielefeld', labels: { 'de-DE': 'Bielefeld', 'en-US': 'Bielefeld' } },
  { id: 'bochum', labels: { 'de-DE': 'Bochum', 'en-US': 'Bochum' } },
  { id: 'aachen', labels: { 'de-DE': 'Aachen', 'en-US': 'Aachen' } },
  { id: 'nordberg', labels: { 'de-DE': 'Nordberg', 'en-US': 'Nordberg' } },
  { id: 'hamburg', labels: { 'de-DE': 'Hamburg', 'en-US': 'Hamburg' } },
  { id: 'koeln', labels: { 'de-DE': 'Köln', 'en-US': 'Cologne' } },
]

const specializationIdOverrides: Record<string, string> = {
  'Allgemeinmedizin': 'general-medicine',
  'Innere Medizin': 'internal-medicine',
  'Innere Medizin und Kardiologie': 'cardiology',
  'Zahnmedizin': 'dentistry',
  'Radiologie': 'radiology',
  'Orthopädie und Unfallchirurgie': 'orthopedics',
}

function specializationIdFromLabel(labelDe: string): string {
  const trimmed = labelDe.trim()
  const override = specializationIdOverrides[trimmed]
  if (override) {
    return override
  }
  return trimmed
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const specializationLabels: Array<[string, string]> = [
  ['Allgemeinmedizin', 'General medicine'],
  ['Allgemeinmedizin - Hausärztliche Versorgung', 'General medicine - primary care'],
  ['Anästhesiologie', 'Anesthesiology'],
  ['Anatomie', 'Anatomy'],
  ['Arbeitsmedizin', 'Occupational medicine'],
  ['Augenheilkunde', 'Ophthalmology'],
  ['Biochemie', 'Biochemistry'],
  ['Allgemeine Chirurgie', 'General surgery'],
  ['Gefäßchirurgie', 'Vascular surgery'],
  ['Herzchirurgie', 'Cardiac surgery'],
  ['Kinderchirurgie', 'Pediatric surgery'],
  ['Orthopädie und Unfallchirurgie', 'Orthopedics and trauma surgery'],
  ['Plastische und Ästhetische Chirurgie', 'Plastic and aesthetic surgery'],
  ['Thoraxchirurgie', 'Thoracic surgery'],
  ['Visceralchirurgie', 'Visceral surgery'],
  ['Frauenheilkunde und Geburtshilfe', 'Gynecology and obstetrics'],
  ['Gynäkologische Endokrinologie und Reproduktionsmedizin', 'Gynecological endocrinology and reproductive medicine'],
  ['Gynäkologische Onkologie', 'Gynecological oncology'],
  ['Spezielle Geburtshilfe und Perinatalmedizin', 'Specialized obstetrics and perinatal medicine'],
  ['Hals-Nasen-Ohrenheilkunde', 'Otorhinolaryngology'],
  ['Sprach-, Stimm- und kindliche Hörstörungen', 'Speech, voice and pediatric hearing disorders'],
  ['Haut- und Geschlechtskrankheiten', 'Dermatology and venereology'],
  ['Humangenetik', 'Human genetics'],
  ['Hygiene und Umweltmedizin', 'Hygiene and environmental medicine'],
  ['Innere Medizin', 'Internal medicine'],
  ['Innere Medizin - Hausärztliche Versorgung', 'Internal medicine - primary care'],
  ['Innere und Allgemeinmedizin', 'Internal and general medicine'],
  ['Innere Medizin und Angiologie', 'Internal medicine and angiology'],
  ['Innere Medizin und Endokrinologie und Diabetologie', 'Internal medicine and endocrinology and diabetology'],
  ['Innere Medizin und Gastroenterologie', 'Internal medicine and gastroenterology'],
  ['Innere Medizin und Hämatologie und Onkologie', 'Internal medicine and hematology and oncology'],
  ['Innere Medizin und Hämatologie und Onkologie, Gastroenterologie', 'Internal medicine and hematology and oncology, gastroenterology'],
  ['Innere Medizin und Kardiologie', 'Internal medicine and cardiology'],
  ['Innere Medizin und Nephrologie', 'Internal medicine and nephrology'],
  ['Innere Medizin und Pneumologie', 'Internal medicine and pulmonology'],
  ['Innere Medizin und Rheumatologie', 'Internal medicine and rheumatology'],
  ['Innere und Allgemeinmedizin - Hausärztliche Versorgung', 'Internal and general medicine - primary care'],
  ['Kinder- und Jugendmedizin', 'Pediatrics'],
  ['Kinder-Hämatologie und Kinder-Onkologie', 'Pediatric hematology and oncology'],
  ['Kinder-Kardiologie', 'Pediatric cardiology'],
  ['Neonatologie', 'Neonatology'],
  ['Neuropädiatrie', 'Neuropediatrics'],
  ['Kinder- und Jugendpsychiatrie und -psychotherapie', 'Child and adolescent psychiatry and psychotherapy'],
  ['Laboratoriumsmedizin', 'Laboratory medicine'],
  ['Mikrobiologie, Virologie und Infektionsepidemiologie', 'Microbiology, virology and infection epidemiology'],
  ['Mund-Kiefer-Gesichtschirurgie', 'Oral and maxillofacial surgery'],
  ['Neurochirurgie', 'Neurosurgery'],
  ['Neurologie', 'Neurology'],
  ['Neurologie und Psychiatrie', 'Neurology and psychiatry'],
  ['Nuklearmedizin', 'Nuclear medicine'],
  ['Palliativärztlicher Konsiliardienst (PKD)', 'Palliative care consultation service (PKD)'],
  ['Pathologie', 'Pathology'],
  ['Neuropathologie', 'Neuropathology'],
  ['Pharmakologie', 'Pharmacology'],
  ['Pharmakologie und Toxikologie', 'Pharmacology and toxicology'],
  ['Physikalische und Rehabilitative Medizin', 'Physical and rehabilitative medicine'],
  ['Physiologie', 'Physiology'],
  ['Praktischer Arzt - Hausärztliche Versorgung', 'General practitioner - primary care'],
  ['Psychiatrie und Psychotherapie', 'Psychiatry and psychotherapy'],
  ['Psychosomatische Medizin und Psychotherapie', 'Psychosomatic medicine and psychotherapy'],
  ['Radiologie', 'Radiology'],
  ['Kinderradiologie', 'Pediatric radiology'],
  ['Neuroradiologie', 'Neuroradiology'],
  ['Rechtsmedizin', 'Forensic medicine'],
  ['Strahlentherapie', 'Radiation therapy'],
  ['Transfusionsmedizin', 'Transfusion medicine'],
  ['Urologie', 'Urology'],
  ['Zahnmedizin', 'Dentistry'],
  ['Akupunktur', 'Acupuncture'],
  ['Allergologie', 'Allergology'],
  ['Andrologie', 'Andrology'],
  ['Dermatohistologie', 'Dermatohistology'],
  ['Diabetologie', 'Diabetology'],
  ['Flugmedizin', 'Aviation medicine'],
  ['Geriatrie', 'Geriatrics'],
  ['Gynäkologische Exfoliativ-Zytologie', 'Gynecological exfoliative cytology'],
  ['Hämostaseologie', 'Hemostaseology'],
  ['Handchirurgie', 'Hand surgery'],
  ['Homöopathie', 'Homeopathy'],
  ['Infektiologie', 'Infectiology'],
  ['Intensivmedizin', 'Intensive care medicine'],
  ['Kinder-Endokrinologie und Kinder-Diabetologie', 'Pediatric endocrinology and diabetology'],
  ['Kinder-Gastroenterologie', 'Pediatric gastroenterology'],
  ['Kinder-Nephrologie', 'Pediatric nephrology'],
  ['Kinder-Orthopädie', 'Pediatric orthopedics'],
  ['Kinder-Pneumologie', 'Pediatric pulmonology'],
  ['Kinder-Rheumatologie', 'Pediatric rheumatology'],
  ['Magnetresonanztomographie', 'Magnetic resonance imaging'],
  ['Manuelle Medizin/Chirotherapie', 'Manual medicine/chiropractic therapy'],
  ['Medikamentöse Tumortherapie', 'Drug-based tumor therapy'],
  ['Naturheilverfahren', 'Naturopathy'],
  ['Orthopädische Rheumatologie', 'Orthopedic rheumatology'],
  ['Palliativmedizin', 'Palliative medicine'],
  ['Phlebologie', 'Phlebology'],
  ['Physikalische Therapie und Balneologie', 'Physical therapy and balneology'],
  ['Plastische Operationen', 'Plastic surgery procedures'],
  ['Proktologie', 'Proctology'],
  ['Psychoanalyse', 'Psychoanalysis'],
  ['Psychotherapie', 'Psychotherapy'],
  ['Röntgendiagnostik', 'Diagnostic radiology'],
  ['Schlafmedizin', 'Sleep medicine'],
  ['Sexualmedizin', 'Sexual medicine'],
  ['Sozialmedizin', 'Social medicine'],
  ['Sportmedizin', 'Sports medicine'],
  ['Strabologie', 'Strabology'],
  ['Suchtmedizinische Grundversorgung', 'Addiction medicine basic care'],
  ['Tropenmedizin', 'Tropical medicine'],
]

export const specializationsSeed: {
  id: string,
  labels: LocalizedLabel,
}[] = specializationLabels.map(([labelDe, labelEn]) => ({
  id: specializationIdFromLabel(labelDe),
  labels: { 'de-DE': labelDe, 'en-US': labelEn },
}))

export const conversationsSeed: ConversationPreview[] = [
  {
    id: 'conv-sophie',
    user: {
      id: 'user-sophie',
      name: 'Dr. med. Sophie Vogt',
      status: 'online',
    },
    lastMessage: {
      id: 'msg-text-1',
      preview: 'Wir haben die Ergebnisse Ihrer Blut…',
      time: chatTime(2026, 7, 8, 9, 12),
      direction: 'incoming',
      status: 'received',
    },
    unreadCount: 1,
  },
  {
    id: 'conv-altstadt',
    user: {
      id: 'user-altstadt',
      name: 'Hausarztpraxis Altstadt',
      imageUri: 'practice-logo',
      status: 'offline',
    },
    lastMessage: {
      id: 'msg-alt-2',
      preview: 'Vielen Dank, ich hole es morgen ab.',
      time: chatTime(2026, 7, 7, 16, 50),
      direction: 'outgoing',
      status: 'read',
    },
    unreadCount: 0,
  },
  {
    id: 'conv-klein',
    user: {
      id: 'user-klein',
      name: 'Zahnarztpraxis Dr. Klein',
      status: 'offline',
    },
    lastMessage: {
      id: 'msg-klein-1',
      preview: 'Bitte kommen Sie 10 Minuten früher.',
      time: chatTime(2026, 7, 7, 10, 5),
      direction: 'incoming',
      status: 'received',
    },
    unreadCount: 0,
  },
  {
    id: 'conv-kern',
    user: {
      id: 'user-kern',
      name: 'Radiologie Dr. Kern',
      status: 'offline',
    },
    lastMessage: {
      id: 'msg-kern-1',
      preview: 'Überweisung erhalten, vielen Dank.',
      time: chatTime(2026, 6, 24, 11, 20),
      direction: 'outgoing',
      status: 'sent',
    },
    unreadCount: 0,
  },
]

export const messagesByConversation: Record<string, Message[]> = {
  'conv-sophie': [
    {
      id: 'msg-date-1',
      type: 'date',
      date: chatTime(2026, 7, 8, 9, 10),
    },
    {
      id: 'msg-text-1',
      type: 'text',
      direction: 'incoming',
      status: 'received',
      body: 'Guten Tag Herr Wellermann, wir haben die Ergebnisse Ihrer Blutuntersuchung erhalten und würden die Werte gerne mit Ihnen besprechen.',
      time: chatTime(2026, 7, 8, 9, 12),
    },
    {
      id: 'msg-card-1',
      type: 'card',
      direction: 'incoming',
      status: 'received',
      kind: 'appointment',
      title: 'Terminvorschlag',
      subtitle: 'Besprechung Blutwerte · 30 Min',
      primary: 'Mi. 8. Juli 2026',
      detail: '15:00 – 15:30 Uhr · Sprechzimmer 2',
      requestId: 'req-checkup',
      mainActionId: 'accept',
      time: chatTime(2026, 7, 8, 9, 15),
      actions: [
        { id: 'accept', label: 'Zusagen' },
        { id: 'decline', label: 'Ablehnen' },
      ],
    },
    {
      id: 'msg-text-2',
      type: 'text',
      direction: 'outgoing',
      status: 'sent',
      body: 'Vielen Dank. 15:00 Uhr passt mir gut – ich komme vorbei.',
      time: chatTime(2026, 7, 8, 9, 20),
    },
    {
      id: 'msg-att-1',
      type: 'attachment',
      direction: 'incoming',
      status: 'received',
      fileName: 'Befund_Blutbild.pdf',
      fileType: 'PDF',
      fileSize: '196 KB',
      time: chatTime(2026, 7, 8, 9, 21),
    },
    {
      id: 'msg-text-3',
      type: 'text',
      direction: 'outgoing',
      status: 'read',
      body: 'Perfekt, ich habe den Befund erhalten. Bis Mittwoch!',
      time: chatTime(2026, 7, 8, 9, 24),
    },
  ],
  'conv-altstadt': [
    {
      id: 'msg-alt-date',
      type: 'date',
      date: chatTime(2026, 7, 7, 16, 40),
    },
    {
      id: 'msg-alt-1',
      type: 'text',
      direction: 'incoming',
      status: 'received',
      body: 'Ihr Rezept liegt zur Abholung bereit.',
      time: chatTime(2026, 7, 7, 16, 42),
    },
    {
      id: 'msg-alt-2',
      type: 'text',
      direction: 'outgoing',
      status: 'read',
      body: 'Vielen Dank, ich hole es morgen ab.',
      time: chatTime(2026, 7, 7, 16, 50),
    },
  ],
  'conv-klein': [
    {
      id: 'msg-klein-1',
      type: 'text',
      direction: 'incoming',
      status: 'received',
      body: 'Bitte kommen Sie 10 Minuten früher.',
      time: chatTime(2026, 7, 7, 10, 5),
    },
  ],
  'conv-kern': [
    {
      id: 'msg-kern-1',
      type: 'text',
      direction: 'outgoing',
      status: 'sent',
      body: 'Überweisung erhalten, vielen Dank.',
      time: chatTime(2026, 6, 24, 11, 20),
    },
  ],
}

export const medicationCatalogSeed: MedicationCatalogItem[] = [
  { id: 'catalog-paracetamol', name: 'Paracetamol' },
  { id: 'catalog-ibuprofen', name: 'Ibuprofen' },
  { id: 'catalog-aspirin', name: 'Aspirin' },
  { id: 'catalog-amoxicillin', name: 'Amoxicillin' },
  { id: 'catalog-cetirizine', name: 'Cetirizine' },
  { id: 'catalog-zip-kompresse', name: '1-KAM Zip-Kompresse' },
  { id: 'catalog-metformin', name: 'Metformin' },
  { id: 'catalog-omeprazole', name: 'Omeprazole' },
  { id: 'catalog-ramipril', name: 'Ramipril' },
  { id: 'catalog-simvastatin', name: 'Simvastatin' },
  { id: 'catalog-levothyroxine', name: 'Levothyroxine' },
  { id: 'catalog-salbutamol', name: 'Salbutamol' },
]

export const patientMedicationsSeed: Medication[] = [
  { id: 'med-paracetamol', name: 'Paracetamol', size: 'n1' },
  { id: 'med-zip-kompresse', name: '1-KAM Zip-Kompresse', size: 'n2' },
  { id: 'med-ibuprofen', name: 'Ibuprofen', size: 'n2' },
  { id: 'med-aspirin', name: 'Aspirin', size: 'n1' },
  { id: 'med-amoxicillin', name: 'Amoxicillin', size: 'n2' },
  { id: 'med-cetirizine', name: 'Cetirizine', size: 'n3' },
]

export const patientProfileSeed: PatientProfile = {
  id: 'patient-wellermann',
  firstName: 'Jonas',
  lastName: 'Wellermann',
  dateOfBirth: new Date(1989, 2, 14),
  email: 'jonas.wellermann@mail.de',
  phone: '+49 170 1234567',
  insurance: {
    insuranceProviderId: 'techniker-krankenkasse',
    insuranceNumber: 'A123456789',
  },
  medicationList: patientMedicationsSeed,
}

function practicePatient(
  profile: Omit<PatientProfile, 'medicationList'> & {
    medicationList?: Medication[],
  }
): PatientProfile {
  return {
    ...profile,
    medicationList: profile.medicationList ?? [],
  }
}

function extraPracticePatients(count: number): PatientProfile[] {
  const firstNames = [
    'Emma', 'Noah', 'Mia', 'Leon', 'Hannah', 'Ben', 'Sofia', 'Elias',
    'Lina', 'Luis', 'Emilia', 'Finn', 'Lena', 'Paul', 'Marie', 'Jonas',
  ]
  const lastNames = [
    'Schmidt', 'Müller', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Hoffmann',
    'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder',
  ]
  const insurers = [
    'barmer',
    'hkk-krankenkasse',
    'techniker-krankenkasse',
    'aok-nordwest',
    'debeka-krankenversicherung',
    'dak-gesundheit',
    'ikk-classic',
    'axa-krankenversicherung',
  ]

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length] ?? 'Max'
    const lastName = (lastNames[Math.floor(index / firstNames.length) % lastNames.length] ?? 'Mustermann').trim()
    const insurer = insurers[index % insurers.length] ?? 'barmer'
    const year = 1950 + (index % 55)
    const month = index % 12
    const day = 1 + (index % 27)

    return practicePatient({
      id: `patient-extra-${String(index + 1).padStart(2, '0')}`,
      firstName,
      lastName: `${lastName} ${index + 1}`,
      dateOfBirth: new Date(year, month, day),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@mail.de`,
      phone: `+49 170 ${String(1000000 + index).slice(1)}`,
      insurance: {
        insuranceProviderId: insurer,
        insuranceNumber: String(20000000 + index),
      },
    })
  })
}

export const householdPatientProfilesSeed: PatientProfile[] = [
  patientProfileSeed,
  practicePatient({
    id: 'patient-torben-wellermann',
    firstName: 'Torben',
    lastName: 'Wellermann',
    dateOfBirth: new Date(1992, 4, 3),
    email: 'torben.wellermann@mail.de',
    phone: '+49 170 2233445',
    insurance: {
      insuranceProviderId: 'hkk-krankenkasse',
      insuranceNumber: '05124723',
    },
    medicationList: [
      { id: 'med-cetirizine-torben', name: 'Cetirizine', size: 'n3' },
    ],
  }),
  practicePatient({
    id: 'patient-emilia-wellermann',
    firstName: 'Emilia',
    lastName: 'Wellermann',
    dateOfBirth: new Date(2018, 6, 9),
    email: 'emilia.wellermann@mail.de',
    phone: '',
    insurance: {
      insuranceProviderId: 'techniker-krankenkasse',
      insuranceNumber: '',
    },
  }),
]

export const practicePatientsSeed: PatientProfile[] = [
  ...householdPatientProfilesSeed,
  practicePatient({
    id: 'patient-giovanni',
    firstName: 'Giovanni',
    lastName: 'di Fruta',
    dateOfBirth: new Date(1984, 8, 21),
    email: 'giovanni.difruta@mail.de',
    phone: '+49 171 5566778',
    insurance: {
      insuranceProviderId: 'aok-nordwest',
      insuranceNumber: 'AOK882190',
    },
  }),
  practicePatient({
    id: 'patient-lena-krueger',
    firstName: 'Lena',
    lastName: 'Krüger',
    dateOfBirth: new Date(1996, 0, 12),
    email: 'lena.krueger@mail.de',
    phone: '+49 176 4411223',
    insurance: {
      insuranceProviderId: 'barmer',
      insuranceNumber: 'BMR104822',
    },
  }),
  practicePatient({
    id: 'patient-markus-hartmann',
    firstName: 'Markus',
    lastName: 'Hartmann',
    dateOfBirth: new Date(1978, 10, 2),
    email: 'markus.hartmann@mail.de',
    phone: '+49 172 9988771',
    insurance: {
      insuranceProviderId: 'techniker-krankenkasse',
      insuranceNumber: 'TK7712034',
    },
  }),
  practicePatient({
    id: 'patient-sophie-berg',
    firstName: 'Sophie',
    lastName: 'Berg',
    dateOfBirth: new Date(1990, 6, 18),
    email: 'sophie.berg@mail.de',
    phone: '+49 175 3344556',
    insurance: {
      insuranceProviderId: 'aok-rheinland-hamburg',
      insuranceNumber: 'AOK330912',
    },
  }),
  practicePatient({
    id: 'patient-paul-richter',
    firstName: 'Paul',
    lastName: 'Richter',
    dateOfBirth: new Date(1969, 3, 9),
    email: 'paul.richter@mail.de',
    phone: '+49 160 1122334',
    insurance: {
      insuranceProviderId: 'debeka-krankenversicherung',
      insuranceNumber: 'DEB552901',
    },
  }),
  practicePatient({
    id: 'patient-anna-schaefer',
    firstName: 'Anna',
    lastName: 'Schäfer',
    dateOfBirth: new Date(1987, 11, 27),
    email: 'anna.schaefer@mail.de',
    phone: '+49 163 7788990',
    insurance: {
      insuranceProviderId: 'allianz-private-krankenversicherung',
      insuranceNumber: 'ALZ219044',
    },
  }),
  practicePatient({
    id: 'patient-nora-klein',
    firstName: 'Nora',
    lastName: 'Klein',
    dateOfBirth: new Date(2001, 1, 5),
    email: 'nora.klein@mail.de',
    phone: '+49 151 6677889',
    insurance: {
      insuranceProviderId: 'dak-gesundheit',
      insuranceNumber: 'DAK440218',
    },
  }),
  practicePatient({
    id: 'patient-tim-vogel',
    firstName: 'Tim',
    lastName: 'Vogel',
    dateOfBirth: new Date(1994, 9, 30),
    email: 'tim.vogel@mail.de',
    phone: '+49 174 2211009',
    insurance: {
      insuranceProviderId: 'hkk-krankenkasse',
      insuranceNumber: 'HKK908812',
    },
  }),
  practicePatient({
    id: 'patient-clara-neumann',
    firstName: 'Clara',
    lastName: 'Neumann',
    dateOfBirth: new Date(1982, 5, 14),
    email: 'clara.neumann@mail.de',
    phone: '+49 177 3344221',
    insurance: {
      insuranceProviderId: 'axa-krankenversicherung',
      insuranceNumber: 'AXA118203',
    },
  }),
  practicePatient({
    id: 'patient-jan-meier',
    firstName: 'Jan',
    lastName: 'Meier',
    dateOfBirth: new Date(1975, 7, 8),
    email: 'jan.meier@mail.de',
    phone: '+49 162 4455667',
    insurance: {
      insuranceProviderId: 'ikk-classic',
      insuranceNumber: 'IKK662104',
    },
  }),
  ...extraPracticePatients(70),
]

export type PracticeTodayAppointmentSeed = {
  id: string,
  profileId: string,
  time: string,
  note: string,
  sickNote?: string,
  status: AppointmentRecord['status'],
  listed?: boolean,
}

export const practiceTodayAppointmentsSeed: PracticeTodayAppointmentSeed[] = [
  {
    id: 'req-today-08-00',
    profileId: 'patient-sophie-berg',
    time: '08:00',
    note: 'Blutdruckkontrolle',
    status: 'confirmed',
  },
  {
    id: 'req-today-08-20',
    profileId: 'patient-markus-hartmann',
    time: '08:20',
    note: 'Diabetes-Kontrolle',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
  },
  {
    id: 'req-today-09-00',
    profileId: 'patient-lena-krueger',
    time: '09:00',
    note: 'Migräne',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
  },
  {
    id: 'req-today-10-20',
    profileId: 'patient-giovanni',
    time: '10:20',
    note: 'Infekt der oberen Atemwege',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
  },
  {
    id: 'req-today-11-00',
    profileId: 'patient-paul-richter',
    time: '11:00',
    note: 'Vorsorgeuntersuchung',
    status: 'confirmed',
  },
  {
    id: 'req-today-14-00',
    profileId: 'patient-torben-wellermann',
    time: '14:00',
    note: 'Infekt der oberen Atemwege',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
  },
  {
    id: 'req-today-14-40',
    profileId: 'patient-anna-schaefer',
    time: '14:40',
    note: 'Schilddrüsenkontrolle',
    status: 'confirmed',
  },
  {
    id: 'req-today-15-20',
    profileId: 'patient-nora-klein',
    time: '15:20',
    note: 'Impfberatung',
    status: 'confirmed',
  },
  {
    id: 'req-today-07-40',
    profileId: 'patient-tim-vogel',
    time: '07:40',
    note: 'Kontrolle',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-08-40',
    profileId: 'patient-jan-meier',
    time: '08:40',
    note: 'Rückenschmerzen',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-09-20',
    profileId: 'patient-wellermann',
    time: '09:20',
    note: 'Folgeuntersuchung',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-09-40',
    profileId: 'patient-clara-neumann',
    time: '09:40',
    note: 'Allergieberatung',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-10-00',
    profileId: 'patient-lena-krueger',
    time: '10:00',
    note: 'AU-Verlängerung',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-10-40',
    profileId: 'patient-markus-hartmann',
    time: '10:40',
    note: 'Erkältung',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-11-20',
    profileId: 'patient-sophie-berg',
    time: '11:20',
    note: 'Magen-Darm-Infekt',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-11-40',
    profileId: 'patient-tim-vogel',
    time: '11:40',
    note: 'Kopfschmerzen',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-13-00',
    profileId: 'patient-jan-meier',
    time: '13:00',
    note: 'Blutentnahme',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-13-20',
    profileId: 'patient-giovanni',
    time: '13:20',
    note: 'Husten',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-13-40',
    profileId: 'patient-nora-klein',
    time: '13:40',
    note: 'AU-Bescheinigung',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-15-00',
    profileId: 'patient-paul-richter',
    time: '15:00',
    note: 'Check-up',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-15-40',
    profileId: 'patient-anna-schaefer',
    time: '15:40',
    note: 'Reiseberatung',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-16-00',
    profileId: 'patient-torben-wellermann',
    time: '16:00',
    note: 'Halsentzündung',
    sickNote: 'Arbeitgeber',
    status: 'confirmed',
    listed: false,
  },
  {
    id: 'req-today-16-20',
    profileId: 'patient-clara-neumann',
    time: '16:20',
    note: 'Nachsorge',
    status: 'confirmed',
    listed: false,
  },
]

export const doctorsOfficesSeed: Record<string, DoctorsOfficeSeed> = {
  'office-moser': {
    id: 'office-moser',
    name: 'Dr. Moser',
    phoneNumber: '040 3187612001',
    faxNumber: '040 3187612002',
    imageUri: 'doctor-portrait',
    openingHours: openingHours({
      monday: ['7:00 - 16:00'],
      tuesday: ['7:00 - 12:00', '14:00 - 16:00'],
      wednesday: ['7:00 - 12:00'],
      thursday: ['7:00 - 16:00'],
      friday: ['7:00 - 12:00'],
    }),
    openingHoursNote: {
      'de-DE': 'Termine nach Vereinbarung möglich.',
      'en-US': 'Appointments available by arrangement.',
    },
    address: address('Teichweg', 12, '22637', 'Nordberg'),
    websiteUrl: 'https://www.dr-moser.de',
    specialization: {
      'de-DE': 'Allgemeinmedizin - Innere Medizin',
      'en-US': 'General medicine - Internal medicine',
    },
    specializationIds: ['general-medicine', 'internal-medicine'],
    onlineServices: {
      orderPrescriptions: true,
      shipPrescriptionByMail: true,
      orderReferrals: true,
      receiveDocuments: true,
      requestAppointments: true,
    },
    offers: [
      {
        id: 'online-vaccination-appointment',
        name: {
          'de-DE': 'Online-Termin für Impfungen',
          'en-US': 'Online appointment for vaccinations',
        },
        description: {
          'de-DE': 'Terminbuchung für Impfungen online',
          'en-US': 'Book vaccination appointments online',
        },
      },
    ],
    services: [
      {
        id: 'vaccinations',
        name: { 'de-DE': 'Impfungen', 'en-US': 'Vaccinations' },
        description: {
          'de-DE': 'Standard- und Reiseimpfungen',
          'en-US': 'Standard and travel vaccinations',
        },
        url: 'https://www.dr-moser.de/impfungen',
      },
      {
        id: 'preventive-checkup',
        name: { 'de-DE': 'Vorsorgeuntersuchung', 'en-US': 'Preventive checkup' },
        description: {
          'de-DE': 'Regelmäßige Vorsorge und Check-ups',
          'en-US': 'Regular preventive care and check-ups',
        },
      },
      {
        id: 'dmp',
        name: { 'de-DE': 'DMP', 'en-US': 'DMP' },
        description: {
          'de-DE': 'Disease-Management-Programme',
          'en-US': 'Disease management programmes',
        },
      },
    ],
    doctors: [
      {
        id: 'doctor-moser',
        name: { 'de-DE': 'Dr. Moser', 'en-US': 'Dr. Moser' },
        imageUri: 'doctor-portrait',
      },
    ],
    cityId: 'nordberg',
    specializationId: 'internal-medicine',
  },
  'office-haumann': {
    id: 'office-haumann',
    name: 'Dr. Haumann',
    phoneNumber: '0241 5566 730',
    openingHours: openingHours({
      monday: ['8:00 - 12:00'],
      tuesday: ['8:00 - 12:00'],
      thursday: ['8:00 - 12:00', '14:00 - 17:00'],
      friday: ['8:00 - 12:00'],
    }),
    address: address('Pontstraße', 55, '52062', 'Aachen'),
    websiteUrl: 'https://www.dr-haumann.de',
    offers: [
      {
        id: 'video-consultation',
        name: { 'de-DE': 'Videosprechstunde', 'en-US': 'Video consultation' },
        description: {
          'de-DE': 'Beratung per Videoanruf',
          'en-US': 'Consultation via video call',
        },
      },
    ],
    services: [
      {
        id: 'home-visits',
        name: { 'de-DE': 'Hausbesuche', 'en-US': 'Home visits' },
        description: {
          'de-DE': 'Hausbesuche nach Vereinbarung',
          'en-US': 'Home visits by appointment',
        },
      },
      {
        id: 'video-consultation',
        name: { 'de-DE': 'Videosprechstunde', 'en-US': 'Video consultation' },
        description: {
          'de-DE': 'Videosprechstunde für Bestandspatienten',
          'en-US': 'Video consultation for existing patients',
        },
      },
    ],
    doctors: [
      {
        id: 'doctor-haumann',
        name: { 'de-DE': 'Dr. Haumann', 'en-US': 'Dr. Haumann' },
      },
    ],
    cityId: 'aachen',
    specializationId: 'general-medicine',
  },
  'office-vogt': {
    id: 'office-vogt',
    name: 'Dr. med. Sophie Vogt',
    phoneNumber: '030 88776611',
    imageUri: 'doctor-portrait',
    openingHours: openingHours({
      monday: ['8:00 - 16:00'],
      tuesday: ['8:00 - 16:00'],
      wednesday: ['8:00 - 12:00'],
      thursday: ['8:00 - 16:00'],
      friday: ['8:00 - 12:00'],
    }),
    address: address('Friedrichstraße', 88, '10117', 'Berlin'),
    websiteUrl: 'https://www.kardiologie-vogt.de',
    offers: [
      {
        id: 'stress-ecg',
        name: { 'de-DE': 'Belastungs-EKG', 'en-US': 'Stress ECG' },
        description: {
          'de-DE': 'Belastungs-EKG in der Praxis',
          'en-US': 'Stress ECG at the practice',
        },
      },
    ],
    doctors: [
      {
        id: 'doctor-vogt',
        name: {
          'de-DE': 'Dr. med. Sophie Vogt',
          'en-US': 'Dr. med. Sophie Vogt',
        },
        imageUri: 'doctor-portrait',
      },
    ],
    cityId: 'berlin',
    specializationId: 'cardiology',
  },
  'office-klein': {
    id: 'office-klein',
    name: 'Zahnarztpraxis Dr. Klein',
    phoneNumber: '0521 334455',
    imageUri: 'practice-logo',
    openingHours: openingHours({
      monday: ['9:00 - 17:00'],
      tuesday: ['9:00 - 17:00'],
      wednesday: ['9:00 - 13:00'],
      thursday: ['9:00 - 17:00'],
      friday: ['9:00 - 13:00'],
    }),
    address: address('Jahnplatz', 4, '33602', 'Bielefeld'),
    websiteUrl: 'https://www.zahnarzt-klein.de',
    offers: [
      {
        id: 'professional-dental-cleaning',
        name: {
          'de-DE': 'Professionelle Zahnreinigung',
          'en-US': 'Professional dental cleaning',
        },
        description: {
          'de-DE': 'Professionelle Zahnreinigung und Prophylaxe',
          'en-US': 'Professional dental cleaning and prophylaxis',
        },
      },
    ],
    doctors: [
      {
        id: 'doctor-klein',
        name: { 'de-DE': 'Dr. Klein', 'en-US': 'Dr. Klein' },
      },
    ],
    cityId: 'bielefeld',
    specializationId: 'dentistry',
  },
  'office-kern': {
    id: 'office-kern',
    name: 'Radiologie Dr. Kern',
    phoneNumber: '0234 998877',
    imageUri: 'practice-logo',
    openingHours: openingHours({
      monday: ['7:30 - 15:30'],
      tuesday: ['7:30 - 15:30'],
      wednesday: ['7:30 - 15:30'],
      thursday: ['7:30 - 15:30'],
      friday: ['7:30 - 12:00'],
    }),
    address: address('Kortumstraße', 19, '44787', 'Bochum'),
    websiteUrl: 'https://www.radiologie-kern.de',
    offers: [
      {
        id: 'mri-without-waiting',
        name: { 'de-DE': 'MRT ohne Wartezeit', 'en-US': 'MRI without waiting' },
        description: {
          'de-DE': 'MRT-Termine mit kurzer Wartezeit',
          'en-US': 'MRI appointments with short waiting times',
        },
      },
    ],
    doctors: [
      {
        id: 'doctor-kern',
        name: { 'de-DE': 'Dr. Kern', 'en-US': 'Dr. Kern' },
      },
    ],
    cityId: 'bochum',
    specializationId: 'radiology',
  },
  'office-altstadt': {
    id: 'office-altstadt',
    name: 'Hausarztpraxis Altstadt',
    phoneNumber: '0241 112233',
    imageUri: 'practice-logo',
    openingHours: openingHours({
      monday: ['8:00 - 18:00'],
      tuesday: ['8:00 - 18:00'],
      wednesday: ['8:00 - 13:00'],
      thursday: ['8:00 - 18:00'],
      friday: ['8:00 - 13:00'],
    }),
    address: address('Markt', 12, '52062', 'Aachen'),
    websiteUrl: 'https://www.hausarzt-altstadt.de',
    offers: [
      {
        id: 'home-visits',
        name: { 'de-DE': 'Hausbesuche', 'en-US': 'Home visits' },
        description: {
          'de-DE': 'Hausbesuche für immobile Patienten',
          'en-US': 'Home visits for immobile patients',
        },
      },
    ],
    doctors: [
      {
        id: 'doctor-altstadt',
        name: {
          'de-DE': 'Hausarztpraxis Altstadt',
          'en-US': 'Hausarztpraxis Altstadt',
        },
      },
    ],
    cityId: 'aachen',
    specializationId: 'general-medicine',
  },
  'office-willendorfer': {
    id: 'office-willendorfer',
    name: 'Dr. Anton Willendorfer',
    phoneNumber: '040 44556677',
    openingHours: openingHours({
      monday: ['8:00 - 16:00'],
      tuesday: ['8:00 - 16:00'],
      wednesday: ['8:00 - 12:00'],
      thursday: ['8:00 - 16:00'],
      friday: ['8:00 - 12:00'],
    }),
    address: address('Alsterweg', 8, '22637', 'Nordberg'),
    websiteUrl: 'https://www.ortho-willendorfer.de',
    specialization: {
      'de-DE': 'Orthopädie',
      'en-US': 'Orthopedics',
    },
    offers: [
      {
        id: 'back-consultation',
        name: { 'de-DE': 'Rückensprechstunde', 'en-US': 'Back consultation' },
        description: {
          'de-DE': 'Spezielle Sprechstunde für Rückenbeschwerden',
          'en-US': 'Special consultation for back pain',
        },
      },
    ],
    doctors: [
      {
        id: 'doctor-willendorfer',
        name: {
          'de-DE': 'Dr. Anton Willendorfer',
          'en-US': 'Dr. Anton Willendorfer',
        },
      },
    ],
    cityId: 'nordberg',
    specializationId: 'orthopedics',
  },
}

export const patientProfilesSeed: PatientProfileSummary[] = householdPatientProfilesSeed.map(
  (profile) => toPatientProfileSummary(profile)
)

export const appointmentsSeed: AppointmentRecord[] = [
  {
    id: 'req-checkup',
    doctorsOfficeId: 'office-moser',
    profileId: patientProfileSeed.id,
    date: '2025-06-22',
    time: '14:00',
    isEmergency: false,
    note: '',
    sickNote: 'Arbeitgeber',
    status: 'requested',
  },
  {
    id: 'req-haumann-vaccine',
    doctorsOfficeId: 'office-haumann',
    profileId: patientProfileSeed.id,
    date: '2025-06-21',
    time: '10:00',
    isEmergency: false,
    note: '',
    status: 'confirmed',
  },
]

export const prescriptionsSeed: PrescriptionRecord[] = [
  {
    id: 'req-limptar',
    doctorsOfficeId: 'office-moser',
    profileId: patientProfileSeed.id,
    shipByMail: true,
    note: 'Wenn möglich bitte zwei kleine Packungen Paracetamol. Vielen Dank und lieben Gruß.',
    medications: [
      { id: 'rx-med-paracetamol', name: 'Paracetamol', size: 'n2' },
      { id: 'rx-med-zip', name: '1-KAM Zip-Kompresse', size: 'n1' },
    ],
    status: 'inProgress',
  },
  {
    id: 'req-aciclovir',
    doctorsOfficeId: 'office-moser',
    profileId: patientProfileSeed.id,
    shipByMail: false,
    note: '',
    medications: [
      { id: 'rx-med-aciclovir', name: 'Amoxicillin', size: 'n1' },
    ],
    status: 'inProgress',
  },
  {
    id: 'req-floxal',
    doctorsOfficeId: 'office-moser',
    profileId: patientProfileSeed.id,
    shipByMail: true,
    note: '',
    medications: [
      { id: 'rx-med-floxal', name: 'Ibuprofen', size: 'n3' },
    ],
    status: 'ready',
  },
]

export const referralsSeed: ReferralRecord[] = [
  {
    id: 'req-radiologie',
    doctorsOfficeId: 'office-moser',
    profileId: patientProfileSeed.id,
    specialization: 'Radiologie',
    reason:
      'Anhaltendes Unwohlsein und starke Schmerzen im unteren Rücken.',
    status: 'inProgress',
  },
  {
    id: 'req-ortho-lena',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-lena-krueger',
    specialization: 'Orthopädie',
    reason: 'Anhaltende Knieschmerzen nach Belastung.',
    status: 'inProgress',
  },
  {
    id: 'req-cardio-markus',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-markus-hartmann',
    specialization: 'Kardiologie',
    reason: 'Belastungsdyspnoe und unregelmäßiger Puls.',
    status: 'inProgress',
  },
  {
    id: 'req-derm-sophie',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-sophie-berg',
    specialization: 'Dermatologie',
    reason: 'Unklare Hautveränderung am Unterarm.',
    status: 'inProgress',
  },
  {
    id: 'req-gastro-paul',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-paul-richter',
    specialization: 'Gastroenterologie',
    reason: 'Wiederkehrende Oberbauchbeschwerden.',
    status: 'inProgress',
  },
  {
    id: 'req-neuro-anna',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-anna-schaefer',
    specialization: 'Neurologie',
    reason: 'Häufende Migräneattacken.',
    status: 'inProgress',
  },
  {
    id: 'req-hno-nora',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-nora-klein',
    specialization: 'HNO',
    reason: 'Wiederkehrende Nasennebenhöhlenentzündungen.',
    status: 'inProgress',
  },
  {
    id: 'req-augen-tim',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-tim-vogel',
    specialization: 'Augenheilkunde',
    reason: 'Sehstörungen und Blendempfindlichkeit.',
    status: 'inProgress',
  },
  {
    id: 'req-uro-jan',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-jan-meier',
    specialization: 'Urologie',
    reason: 'Kontrolluntersuchung nach Infekt.',
    status: 'inProgress',
  },
  {
    id: 'req-pulm-giovanni',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-giovanni',
    specialization: 'Pneumologie',
    reason: 'Anhaltender Husten über drei Wochen.',
    status: 'inProgress',
  },
  {
    id: 'req-endo-clara',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-clara-neumann',
    specialization: 'Endokrinologie',
    reason: 'Abklärung der Schilddrüsenwerte.',
    status: 'inProgress',
  },
  {
    id: 'req-chir-torben',
    doctorsOfficeId: 'office-moser',
    profileId: 'patient-torben-wellermann',
    specialization: 'Chirurgie',
    reason: 'Abklärung einer Weichteilschwellung.',
    status: 'inProgress',
  },
]

export const practiceConversationsSeed: ConversationPreview[] = [
  {
    id: 'conv-practice-giovanni',
    user: {
      id: 'patient-giovanni',
      name: 'Giovanni di Fruta',
      status: 'online',
    },
    lastMessage: {
      id: 'practice-msg-giovanni-2',
      preview: 'Ich habe seit drei Tagen starken Husten und wollte fragen, ob ich vorbeikommen kann.',
      time: chatTime(2026, 9, 9, 12, 37),
      direction: 'incoming',
      status: 'received',
    },
    unreadCount: 1,
  },
  {
    id: 'conv-practice-lena',
    user: {
      id: 'patient-lena-krueger',
      name: 'Lena Krüger',
      status: 'offline',
    },
    lastMessage: {
      id: 'practice-msg-lena-2',
      preview: 'Die Migräne ist heute wieder sehr stark, kann ich eine AU bekommen?',
      time: chatTime(2026, 9, 8, 19, 22),
      direction: 'incoming',
      status: 'received',
    },
    unreadCount: 1,
  },
  {
    id: 'conv-practice-wellermann',
    user: {
      id: patientProfileSeed.id,
      name: `${patientProfileSeed.firstName} ${patientProfileSeed.lastName}`,
      status: 'online',
    },
    lastMessage: {
      id: 'practice-msg-text-3',
      preview: 'Perfekt, ich habe den Befund erhalten. Bis Mittwoch!',
      time: chatTime(2026, 9, 8, 9, 24),
      direction: 'incoming',
      status: 'read',
    },
    unreadCount: 0,
  },
  {
    id: 'conv-practice-prescription',
    user: {
      id: 'patient-torben-wellermann',
      name: 'Torben Wellermann',
      status: 'offline',
    },
    lastMessage: {
      id: 'practice-msg-rx-2',
      preview: 'Vielen Dank, ich hole es morgen ab.',
      time: chatTime(2026, 9, 7, 16, 50),
      direction: 'incoming',
      status: 'read',
    },
    unreadCount: 0,
  },
]

export const practiceMessagesByConversation: Record<string, Message[]> = {
  'conv-practice-giovanni': [
    {
      id: 'practice-msg-giovanni-date',
      type: 'date',
      date: chatTime(2026, 9, 9, 12, 30),
    },
    {
      id: 'practice-msg-giovanni-1',
      type: 'text',
      direction: 'outgoing',
      status: 'read',
      body: 'Guten Tag Herr di Fruta, wie können wir Ihnen helfen?',
      time: chatTime(2026, 9, 9, 12, 32),
    },
    {
      id: 'practice-msg-giovanni-2',
      type: 'text',
      direction: 'incoming',
      status: 'received',
      body: 'Ich habe seit drei Tagen starken Husten und wollte fragen, ob ich vorbeikommen kann.',
      time: chatTime(2026, 9, 9, 12, 37),
    },
    {
      id: 'practice-msg-giovanni-card',
      type: 'card',
      direction: 'incoming',
      status: 'received',
      kind: 'referral',
      title: 'Überweisung Pneumologie',
      subtitle: 'Anhaltender Husten',
      primary: 'Pneumologie',
      detail: 'Anhaltender Husten über drei Wochen.',
      requestId: 'req-pulm-giovanni',
      time: chatTime(2026, 9, 9, 12, 40),
    },
  ],
  'conv-practice-lena': [
    {
      id: 'practice-msg-lena-date',
      type: 'date',
      date: chatTime(2026, 9, 8, 19, 10),
    },
    {
      id: 'practice-msg-lena-1',
      type: 'text',
      direction: 'outgoing',
      status: 'read',
      body: 'Guten Abend Frau Krüger, haben die Tabletten geholfen?',
      time: chatTime(2026, 9, 8, 19, 14),
    },
    {
      id: 'practice-msg-lena-2',
      type: 'text',
      direction: 'incoming',
      status: 'received',
      body: 'Die Migräne ist heute wieder sehr stark, kann ich eine AU bekommen?',
      time: chatTime(2026, 9, 8, 19, 22),
    },
  ],
  'conv-practice-wellermann': [
    {
      id: 'practice-msg-date-1',
      type: 'date',
      date: chatTime(2026, 7, 8, 9, 10),
    },
    {
      id: 'practice-msg-text-1',
      type: 'text',
      direction: 'outgoing',
      status: 'read',
      body: 'Guten Tag Herr Wellermann, wir haben die Ergebnisse Ihrer Blutuntersuchung erhalten und würden die Werte gerne mit Ihnen besprechen.',
      time: chatTime(2026, 7, 8, 9, 12),
    },
    {
      id: 'practice-msg-card-1',
      type: 'card',
      direction: 'outgoing',
      status: 'read',
      kind: 'appointment',
      title: 'Terminvorschlag',
      subtitle: 'Besprechung Blutwerte · 30 Min',
      primary: 'Mi. 8. Juli 2026',
      detail: '15:00 – 15:30 Uhr · Sprechzimmer 2',
      requestId: 'req-checkup',
      time: chatTime(2026, 7, 8, 9, 15),
    },
    {
      id: 'practice-msg-text-2',
      type: 'text',
      direction: 'incoming',
      status: 'received',
      body: 'Vielen Dank. 15:00 Uhr passt mir gut – ich komme vorbei.',
      time: chatTime(2026, 7, 8, 9, 20),
    },
    {
      id: 'practice-msg-att-1',
      type: 'attachment',
      direction: 'outgoing',
      status: 'read',
      fileName: 'Befund_Blutbild.pdf',
      fileType: 'PDF',
      fileSize: '196 KB',
      time: chatTime(2026, 7, 8, 9, 21),
    },
    {
      id: 'practice-msg-text-3',
      type: 'text',
      direction: 'incoming',
      status: 'read',
      body: 'Perfekt, ich habe den Befund erhalten. Bis Mittwoch!',
      time: chatTime(2026, 7, 8, 9, 24),
    },
  ],
  'conv-practice-prescription': [
    {
      id: 'practice-msg-rx-date',
      type: 'date',
      date: chatTime(2026, 7, 7, 16, 40),
    },
    {
      id: 'practice-msg-rx-1',
      type: 'text',
      direction: 'outgoing',
      status: 'read',
      body: 'Ihr Rezept liegt zur Abholung bereit.',
      time: chatTime(2026, 7, 7, 16, 42),
    },
    {
      id: 'practice-msg-rx-2',
      type: 'text',
      direction: 'incoming',
      status: 'read',
      body: 'Vielen Dank, ich hole es morgen ab.',
      time: chatTime(2026, 7, 7, 16, 50),
    },
  ],
}

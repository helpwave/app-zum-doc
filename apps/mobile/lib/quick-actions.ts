import type { PatientRequestType } from "@app-zum-doc/utils/api"

export const homeQuickActions: readonly {
  id: PatientRequestType
  href: string
}[] = [
  { id: "prescription", href: "/requests/prescription/create" },
  { id: "appointment", href: "/requests/appointment/create" },
  { id: "referral", href: "/requests/referral/create" },
]

export const quickActionTranslationKeys: Record<
  PatientRequestType,
  "actionPrescription" | "actionAppointment" | "actionReferral"
> = {
  prescription: "actionPrescription",
  appointment: "actionAppointment",
  referral: "actionReferral",
}

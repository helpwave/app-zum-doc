import type { MedicationSize } from "./enums"

export type MedicationCatalogItem = {
  id: string
  name: string
}

export type Medication = {
  id: string
  name: string
  size: MedicationSize
}

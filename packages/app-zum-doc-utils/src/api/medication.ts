import type { MedicationSize } from "./enums"

export type MedicationCatalogItem = {
  id: string
  name: string
  ingredient?: string
}

export type MedicationSearchPage = {
  date: string
  source: string
  page: number
  pageSize: number
  hasMore: boolean
  results: MedicationCatalogItem[]
}

export type MedicationPznSearch = {
  date: string
  source: string
  hasResult: boolean
  results: MedicationCatalogItem | null
}

export type Medication = {
  id: string
  name: string
  size: MedicationSize
}

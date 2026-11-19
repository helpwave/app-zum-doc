import type { MedicationSize } from './enums'

export type Substance = {
  id: string,
  name: string,
  strength: string,
}

export type MedicationCatalogItem = {
  id: string,
  pzn: string,
  kind: string,
  name: string,
  ingredient: Substance[],
  size?: MedicationSize,
}

export type MedicationSearchPage = {
  date: string,
  source: string,
  page: number,
  pageSize: number,
  hasMore: boolean,
  results: MedicationCatalogItem[],
}

export type MedicationPznSearch = {
  date: string,
  source: string,
  hasResult: boolean,
  results: MedicationCatalogItem | null,
}

export type Medication = {
  id: string,
  name: string,
  size: MedicationSize,
  ingredient: Substance[],
}


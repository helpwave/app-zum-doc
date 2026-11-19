import type { MedicationSize } from './enums'

export type Substance = {
  id: string,
  name: string,
  strength: string,
}

export type PackageSize = 'N1' | 'N2' | 'N3'

export type MedicationCatalogItem = {
  id: string,
  pzn: string,
  kind: string,
  name: string,
  ingredient: Substance[],
  packageSize?: PackageSize,
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

export function medicationSizeFromPackageSize(
  packageSize: PackageSize | null | undefined
): MedicationSize | undefined {
  if (packageSize === 'N1') {
    return 'n1'
  }
  if (packageSize === 'N2') {
    return 'n2'
  }
  if (packageSize === 'N3') {
    return 'n3'
  }
  return undefined
}

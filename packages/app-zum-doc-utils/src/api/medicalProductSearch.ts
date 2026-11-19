import type {
  MedicationCatalogItem,
  MedicationPznSearch,
  MedicationSearchPage,
  PackageSize,
  Substance
} from './medication'

const pageSize = 20

export class MedicalProductSearchUnavailableError extends Error {
  constructor() {
    super('Medikamentensuche ist nicht erreichbar.')
    this.name = 'MedicalProductSearchUnavailableError'
  }
}

type ServiceProduct = {
  id: string,
  pzn: string,
  type: string,
  name: string,
  ingredient: Substance[] | null,
  packageSize?: PackageSize | null,
}

type ServiceNameSearch = {
  date: string,
  source: string,
  page: number,
  pageSize: number,
  hasMore: boolean,
  results: ServiceProduct[],
}

type ServicePznSearch = {
  date: string,
  source: string,
  hasResult: boolean,
  results: ServiceProduct | null,
}

export function medicalProductSearchBaseUrl() {
  const value = process.env.EXPO_PUBLIC_MEDICAL_PRODUCT_SEARCH_URL
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

async function readJson<T>(url: URL): Promise<T> {
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new MedicalProductSearchUnavailableError()
  }
  if (!response.ok) {
    throw new Error('Medikamentensuche fehlgeschlagen.')
  }
  return await response.json() as T
}

function serviceUrl(baseUrl: string, path: string) {
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return new URL(path, normalized)
}

function toCatalogItem(product: ServiceProduct): MedicationCatalogItem {
  const packageSize = product.packageSize === 'N1' || product.packageSize === 'N2' || product.packageSize === 'N3'
    ? product.packageSize
    : undefined
  return {
    id: product.id,
    pzn: product.pzn,
    kind: product.type,
    name: product.name,
    ingredient: Array.isArray(product.ingredient) ? product.ingredient : [],
    packageSize,
  }
}

export type MedicationBarcodeFormat = 'code39' | 'datamatrix'

const code39Pzn = /^(?:-(\d{8})|(\d{8})|(\d{7}))$/

function pznFromCode39(value: string) {
  const match = value.trim().match(code39Pzn)
  if (match?.[1]) {
    return match[1]
  }
  if (match?.[2]) {
    return match[2]
  }
  if (match?.[3]) {
    return `0${match[3]}`
  }
  return null
}

function pznFromGtin14(gtin: string) {
  if (!gtin.startsWith('04150')) {
    return null
  }
  return gtin.slice(5, 13)
}

function pznFromNtin13(ntin: string) {
  if (!ntin.startsWith('4150')) {
    return null
  }
  return ntin.slice(4, 12)
}

function pznFromDataMatrix(value: string) {
  const gtin = value.match(/(?:\(01\)|(?:^|\u001d)01)(\d{14})/)
  if (gtin?.[1]) {
    const pzn = pznFromGtin14(gtin[1])
    if (pzn) {
      return pzn
    }
  }
  const ppn = value.match(/9N(11\d{10})/)
  if (ppn?.[1]) {
    return ppn[1].slice(2, 10)
  }
  const compact = value.trim()
  if (/^\d{14}$/.test(compact)) {
    return pznFromGtin14(compact)
  }
  if (/^\d{13}$/.test(compact)) {
    return pznFromNtin13(compact)
  }
  return null
}

export function pznFromBarcode(value: string, format: MedicationBarcodeFormat) {
  if (format === 'code39') {
    return pznFromCode39(value)
  }
  return pznFromDataMatrix(value)
}

export async function fetchMedicalProductsByName(
  baseUrl: string,
  search: string,
  page: number
): Promise<MedicationSearchPage> {
  const url = serviceUrl(baseUrl, 'search/name/')
  url.searchParams.set('q', search)
  url.searchParams.set('page', String(Math.max(1, page)))
  const body = await readJson<ServiceNameSearch>(url)
  return {
    date: body.date,
    source: body.source,
    page: body.page,
    pageSize: body.pageSize,
    hasMore: body.hasMore,
    results: body.results.map(toCatalogItem),
  }
}

export async function fetchMedicalProductByPzn(
  baseUrl: string,
  pzn: string
): Promise<MedicationPznSearch> {
  const url = serviceUrl(baseUrl, 'search/pzn/')
  url.searchParams.set('pzn', pzn)
  const body = await readJson<ServicePznSearch>(url)
  return {
    date: body.date,
    source: body.source,
    hasResult: body.hasResult,
    results: body.results == null ? null : toCatalogItem(body.results),
  }
}

export function emptyMedicationSearchPage(page = 1): MedicationSearchPage {
  return {
    date: '',
    source: '',
    page,
    pageSize,
    hasMore: false,
    results: [],
  }
}


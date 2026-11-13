import type {
  MedicationCatalogItem,
  MedicationPznSearch,
  MedicationSearchPage,
} from "./medication"

const pageSize = 20

type ServiceProduct = {
  id: string
  pzn: string
  type: string
  name: string
  ingredient: string
}

type ServiceNameSearch = {
  date: string
  source: string
  page: number
  pageSize: number
  hasMore: boolean
  results: ServiceProduct[]
}

type ServicePznSearch = {
  date: string
  source: string
  hasResult: boolean
  results: ServiceProduct | null
}

export function medicalProductSearchBaseUrl() {
  const value = process.env.EXPO_PUBLIC_MEDICAL_PRODUCT_SEARCH_URL
  if (typeof value !== "string") {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function pznFromBarcode(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length === 7 || digits.length === 8) {
    return digits
  }
  if (digits.length > 8) {
    return digits.slice(-8)
  }
  return null
}

export async function fetchMedicalProductsByName(
  baseUrl: string,
  search: string,
  page: number,
): Promise<MedicationSearchPage> {
  const url = serviceUrl(baseUrl, "search/name/")
  url.searchParams.set("q", search)
  url.searchParams.set("page", String(Math.max(1, page)))
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
  pzn: string,
): Promise<MedicationPznSearch> {
  const url = serviceUrl(baseUrl, "search/pzn/")
  url.searchParams.set("pzn", pzn)
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
    date: "",
    source: "",
    page,
    pageSize,
    hasMore: false,
    results: [],
  }
}

function toCatalogItem(product: ServiceProduct): MedicationCatalogItem {
  return {
    id: product.id,
    name: product.name,
    ingredient: product.ingredient,
  }
}

function serviceUrl(baseUrl: string, path: string) {
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  return new URL(path, normalized)
}

async function readJson<T>(url: URL): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Medikamentensuche fehlgeschlagen.")
  }
  return await response.json() as T
}

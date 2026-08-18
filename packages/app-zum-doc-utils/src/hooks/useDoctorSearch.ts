import { useQuery } from "@tanstack/react-query"
import {
  fetchCities,
  fetchDoctors,
  fetchSpecializations,
} from "../api/client"
import type { DoctorSearchFilters } from "../api/types"
import { cityKeys, doctorSearchKeys, specializationKeys } from "./queryKeys"

export function useDoctorSearch(filters: DoctorSearchFilters) {
  return useQuery({
    queryKey: doctorSearchKeys.list(filters),
    queryFn: () => fetchDoctors(filters),
  })
}

export function useCities(
  search: string,
  locale: DoctorSearchFilters["locale"],
  enabled = true,
) {
  return useQuery({
    queryKey: cityKeys.list(search, locale),
    queryFn: () => fetchCities({ search, locale }),
    enabled,
  })
}

export function useSpecializations(
  search: string,
  locale: DoctorSearchFilters["locale"],
  enabled = true,
) {
  return useQuery({
    queryKey: specializationKeys.list(search, locale),
    queryFn: () => fetchSpecializations({ search, locale }),
    enabled,
  })
}

import { useQuery } from "@tanstack/react-query"
import {
  fetchCities,
  fetchDoctors,
  fetchSpecializations
} from "../api/client"
import type { DoctorSearchFilters } from "../api/types"
import { cityKeys, doctorSearchKeys, specializationKeys } from "./queryKeys"

type UseDoctorSearchProps = {
  filters: DoctorSearchFilters
  enabled?: boolean
}

export function useDoctorSearch({
  filters,
  enabled = true,
}: UseDoctorSearchProps) {
  return useQuery({
    queryKey: doctorSearchKeys.list(filters),
    queryFn: () => fetchDoctors(filters),
    enabled,
  })
}

type UseCitiesProps = {
  search: string
  locale: DoctorSearchFilters["locale"]
  enabled?: boolean
}

export function useCities({ search, locale, enabled = true }: UseCitiesProps) {
  return useQuery({
    queryKey: cityKeys.list(search, locale),
    queryFn: () => fetchCities({ search, locale }),
    enabled,
  })
}

type UseSpecializationsProps = {
  search: string
  locale: DoctorSearchFilters["locale"]
  enabled?: boolean
}

export function useSpecializations({
  search,
  locale,
  enabled = true,
}: UseSpecializationsProps) {
  return useQuery({
    queryKey: specializationKeys.list(search, locale),
    queryFn: () => fetchSpecializations({ search, locale }),
    enabled,
  })
}

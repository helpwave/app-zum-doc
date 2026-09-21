import { useQuery } from '@tanstack/react-query'
import type {
  DoctorsOffice,
  DoctorSearchFilters,
  SearchCity,
  SearchSpecialization
} from '../api/types'
import { getApiClient } from './apiClient'
import { assertNotUndefined, type QueryHookOptions } from './queryHook'
import { cityKeys, doctorSearchKeys, specializationKeys } from './queryKeys'

type UseDoctorSearchProps = QueryHookOptions<DoctorSearchFilters, DoctorsOffice[]>
export function useDoctorSearch({
  parameters,
  ...options
}: UseDoctorSearchProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: doctorSearchKeys.list(parameters),
    queryFn: () => client.fetchDoctors(assertNotUndefined(parameters)),
  })
}

type UseCitiesParameter = {
  search: string,
  locale: DoctorSearchFilters['locale'],
}

type UseCitiesProps = QueryHookOptions<UseCitiesParameter, SearchCity[]>

export function useCities({
  parameters,
  ...options
}: UseCitiesProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: cityKeys.list(parameters),
    queryFn: () => client.fetchCities(assertNotUndefined(parameters)),
  })
}

type UseSpecializationsParameter = {
  search: string,
  locale: DoctorSearchFilters['locale'],
}
type UseSpecializationsProps = QueryHookOptions<UseSpecializationsParameter, SearchSpecialization[]>

export function useSpecializations({
  parameters,
  ...options
}: UseSpecializationsProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: specializationKeys.list(parameters),
    queryFn: () => client.fetchSpecializations(assertNotUndefined(parameters)),
  })
}

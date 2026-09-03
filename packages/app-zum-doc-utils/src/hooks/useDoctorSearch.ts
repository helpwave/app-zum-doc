import { useQuery } from '@tanstack/react-query'
import {
  fetchCities,
  fetchDoctors,
  fetchSpecializations
} from '../api/client'
import type {
  DoctorsOffice,
  DoctorSearchFilters,
  SearchCity,
  SearchSpecialization
} from '../api/types'
import { assertNotUndefined, type QueryHookOptions } from './queryHook'
import { cityKeys, doctorSearchKeys, specializationKeys } from './queryKeys'

type UseDoctorSearchProps = QueryHookOptions<DoctorSearchFilters, DoctorsOffice[]>
export function useDoctorSearch({
  parameters,
  ...options
}: UseDoctorSearchProps) {
  return useQuery({
    ...options,
    queryKey: doctorSearchKeys.list(parameters),
    queryFn: () => fetchDoctors(assertNotUndefined(parameters)),
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
  return useQuery({
    ...options,
    queryKey: cityKeys.list(parameters),
    queryFn: () => fetchCities(assertNotUndefined(parameters)),
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
  return useQuery({
    ...options,
    queryKey: specializationKeys.list(parameters),
    queryFn: () => fetchSpecializations(assertNotUndefined(parameters)),
  })
}

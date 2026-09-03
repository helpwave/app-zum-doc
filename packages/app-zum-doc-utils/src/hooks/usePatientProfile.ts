import { useQuery } from '@tanstack/react-query'
import { fetchPatientProfile, fetchPatientProfileById } from '../api/client'
import type { PatientProfile } from '../api/types'
import { assertNotUndefined, type QueryHookOptions, withEnabled } from './queryHook'
import { profileKeys } from './queryKeys'

export function usePatientProfile(
  options: QueryHookOptions<undefined, PatientProfile> = {}
) {
  return useQuery({
    ...options,
    queryKey: profileKeys.patient,
    queryFn: () => fetchPatientProfile(),
  })
}

type UsePatientProfileByIdParameters = {
  profileId: string,
}
type UsePatientProfileByIdProps = QueryHookOptions<UsePatientProfileByIdParameters, PatientProfile>

export function usePatientProfileById({
  parameters,
  enabled,
  ...options
}: UsePatientProfileByIdProps) {
  return useQuery({
    ...options,
    queryKey: profileKeys.byId(parameters),
    queryFn: () => fetchPatientProfileById(assertNotUndefined(parameters)),
    enabled: withEnabled(parameters !== undefined, enabled),
  })
}

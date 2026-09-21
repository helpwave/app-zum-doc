import { useQuery } from '@tanstack/react-query'
import type { PatientProfile } from '../api/types'
import { getApiClient } from './apiClient'
import { assertNotUndefined, type QueryHookOptions, withEnabled } from './queryHook'
import { profileKeys } from './queryKeys'

export function usePatientProfile(
  options: QueryHookOptions<undefined, PatientProfile> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: profileKeys.patient,
    queryFn: client.fetchPatientProfile,
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
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: profileKeys.byId(parameters),
    queryFn: () => client.fetchPatientProfileById(assertNotUndefined(parameters)),
    enabled: withEnabled(parameters !== undefined, enabled),
  })
}

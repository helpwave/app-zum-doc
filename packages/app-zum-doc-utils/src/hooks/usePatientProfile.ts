import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BackupData, CreatePatientProfileInput, PatientProfile } from '../api/types'
import { getApiClient } from './apiClient'
import {
  assertNotUndefined,
  type MutationHookOptions,
  type QueryHookOptions,
  withEnabled
} from './queryHook'
import { medicationKeys, profileKeys, profileListKeys } from './queryKeys'

export function usePatientProfile(
  options: QueryHookOptions<undefined, PatientProfile | null> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: profileKeys.patient,
    queryFn: client.fetchPatientProfile,
  })
}

export function useImportPatientBackup(
  options: MutationHookOptions<PatientProfile, BackupData> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (payload: BackupData) => client.importPatientBackup(payload),
    onSuccess: async (...args) => {
      const [profile] = args
      const current = queryClient.getQueryData<PatientProfile | null>(profileKeys.patient)
      if (current == null || current.id === profile.id) {
        queryClient.setQueryData(profileKeys.patient, profile)
        await queryClient.invalidateQueries({ queryKey: profileKeys.all })
        await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
      }
      await queryClient.invalidateQueries({ queryKey: profileListKeys.all })
      await onSuccess?.(...args)
    },
  })
}

export function useSelectPatientProfile(
  options: MutationHookOptions<PatientProfile, { profileId: string }> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (params: { profileId: string }) => client.selectPatientProfile(params),
    onSuccess: async (...args) => {
      const [profile] = args
      queryClient.setQueryData(profileKeys.patient, profile)
      await queryClient.invalidateQueries({ queryKey: profileKeys.all })
      await queryClient.invalidateQueries({ queryKey: profileListKeys.all })
      await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
      await onSuccess?.(...args)
    },
  })
}

export function useCreatePatientProfile(
  options: MutationHookOptions<PatientProfile, CreatePatientProfileInput> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (input: CreatePatientProfileInput) => client.createPatientProfile(input),
    onSuccess: async (...args) => {
      const [profile] = args
      if (queryClient.getQueryData(profileKeys.patient) == null) {
        queryClient.setQueryData(profileKeys.patient, profile)
        await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
      }
      await queryClient.invalidateQueries({ queryKey: profileListKeys.all })
      await onSuccess?.(...args)
    },
  })
}

export function useDeletePatientProfile(
  options: MutationHookOptions<PatientProfile | null, string> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (profileId: string) => client.deletePatientProfile(profileId),
    onSuccess: async (...args) => {
      const [nextProfile] = args
      queryClient.setQueryData(profileKeys.patient, nextProfile)
      await queryClient.invalidateQueries({ queryKey: profileKeys.all })
      await queryClient.invalidateQueries({ queryKey: profileListKeys.all })
      await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
      await onSuccess?.(...args)
    },
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

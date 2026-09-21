import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  AppLocale,
  CompletePracticeOnboardingInput,
  DoctorsOffice,
  EncryptionKeyTest,
  PracticeEncryptionData,
  PracticeMyData,
  PracticeOnboardingStatus
} from '../api/types'
import { getApiClient } from './apiClient'
import { type MutationHookOptions, type QueryHookOptions } from './queryHook'
import { doctorsOfficeKeys, onboardingKeys, practiceKeys } from './queryKeys'

export function usePracticeOnboardingStatus(
  options: QueryHookOptions<undefined, PracticeOnboardingStatus> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: onboardingKeys.status,
    queryFn: client.fetchPracticeOnboardingStatus,
  })
}

export function usePracticeMyData(
  options: QueryHookOptions<undefined, PracticeMyData> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: onboardingKeys.myData,
    queryFn: client.fetchPracticeMyData,
  })
}

export function usePracticeEncryptionData(
  options: QueryHookOptions<undefined, PracticeEncryptionData> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: onboardingKeys.encryption,
    queryFn: client.fetchPracticeEncryptionData,
  })
}

export function useUploadPracticePublicKey(
  options: MutationHookOptions<PracticeOnboardingStatus, string> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: client.uploadPracticePublicKey,
    onSuccess: async (...args) => {
      const [status, publicKey] = args
      queryClient.setQueryData(onboardingKeys.status, status)
      queryClient.setQueryData(onboardingKeys.encryption, {
        publicKey,
      } satisfies PracticeEncryptionData)
      await onSuccess?.(...args)
    },
  })
}

export function useEncryptionKeyTest(
  options: MutationHookOptions<EncryptionKeyTest, void> = {}
) {
  const client = getApiClient()

  return useMutation({
    ...options,
    mutationFn: client.fetchEncryptionKeyTest,
  })
}

type CompletePracticeOnboardingVariables = {
  locale: AppLocale,
  input: CompletePracticeOnboardingInput,
}

export function useCompletePracticeOnboarding(
  options: MutationHookOptions<DoctorsOffice, CompletePracticeOnboardingVariables> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: client.completePracticeOnboarding,
    onSuccess: async (...args) => {
      const [office, { locale }] = args
      queryClient.setQueryData(
        doctorsOfficeKeys.detail({ id: office.id, locale }),
        office
      )
      queryClient.setQueryData(onboardingKeys.status, {
        hasDoctorsOffice: true,
        hasPublicKey: true,
      })
      await queryClient.invalidateQueries({ queryKey: practiceKeys.all })
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.all })
      await onSuccess?.(...args)
    },
  })
}

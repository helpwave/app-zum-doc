import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  completePracticeOnboarding,
  fetchEncryptionKeyTest,
  fetchPracticeMyData,
  fetchPracticeOnboardingStatus,
  uploadPracticePublicKey
} from '../api/client'
import type {
  AppLocale,
  CompletePracticeOnboardingInput,
  DoctorsOffice,
  EncryptionKeyTest,
  PracticeMyData,
  PracticeOnboardingStatus
} from '../api/types'
import { type MutationHookOptions, type QueryHookOptions } from './queryHook'
import { doctorsOfficeKeys, onboardingKeys, practiceKeys } from './queryKeys'

export function usePracticeOnboardingStatus(
  options: QueryHookOptions<undefined, PracticeOnboardingStatus> = {}
) {
  return useQuery({
    ...options,
    queryKey: onboardingKeys.status,
    queryFn: fetchPracticeOnboardingStatus,
  })
}

export function usePracticeMyData(
  options: QueryHookOptions<undefined, PracticeMyData> = {}
) {
  return useQuery({
    ...options,
    queryKey: onboardingKeys.myData,
    queryFn: fetchPracticeMyData,
  })
}

export function useUploadPracticePublicKey(
  options: MutationHookOptions<PracticeOnboardingStatus, string> = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: uploadPracticePublicKey,
    onSuccess: async (...args) => {
      queryClient.setQueryData(onboardingKeys.status, args[0])
      await onSuccess?.(...args)
    },
  })
}

export function useEncryptionKeyTest(
  options: MutationHookOptions<EncryptionKeyTest, void> = {}
) {
  const { ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: fetchEncryptionKeyTest,
  })
}

type CompletePracticeOnboardingVariables = {
  locale: AppLocale,
  input: CompletePracticeOnboardingInput,
}

export function useCompletePracticeOnboarding(
  options: MutationHookOptions<DoctorsOffice, CompletePracticeOnboardingVariables> = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: completePracticeOnboarding,
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

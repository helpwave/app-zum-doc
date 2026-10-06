import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CompleteAppOnboardingInput, OnboardingInformation } from '../api/appOnboarding'
import { getApiClient } from './apiClient'
import { type MutationHookOptions, type QueryHookOptions } from './queryHook'
import { onboardingKeys, profileKeys, profileListKeys } from './queryKeys'

export function useOnboardingInformation(
  options: QueryHookOptions<undefined, OnboardingInformation> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: onboardingKeys.information,
    queryFn: client.fetchOnboardingInformation,
  })
}

export function useMarkAppOnboarded(
  options: MutationHookOptions<OnboardingInformation, void> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: () => client.markAppOnboarded(),
    onSuccess: async (...args) => {
      const [information] = args
      queryClient.setQueryData(onboardingKeys.information, information)
      await queryClient.invalidateQueries({ queryKey: profileKeys.all })
      await queryClient.invalidateQueries({ queryKey: profileListKeys.all })
      await onSuccess?.(...args)
    },
  })
}

export function useCompleteAppOnboarding(
  options: MutationHookOptions<OnboardingInformation, CompleteAppOnboardingInput> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (input: CompleteAppOnboardingInput) => client.completeAppOnboarding(input),
    onSuccess: async (...args) => {
      const [information] = args
      queryClient.setQueryData(onboardingKeys.information, information)
      await queryClient.invalidateQueries({ queryKey: profileKeys.all })
      await queryClient.invalidateQueries({ queryKey: profileListKeys.all })
      await onSuccess?.(...args)
    },
  })
}

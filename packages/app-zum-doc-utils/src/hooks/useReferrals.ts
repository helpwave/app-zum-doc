import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppLocale, CreateReferralInput, Referral } from '../api/types'
import { getApiClient } from './apiClient'
import {
  assertNotUndefined,
  type MutationHookOptions,
  type QueryHookOptions,
  withEnabled
} from './queryHook'
import { homeKeys, referralKeys } from './queryKeys'

type UseReferralParameters = {
  id: string,
  locale: AppLocale,
}
type UseReferralProps = QueryHookOptions<UseReferralParameters, Referral>

export function useReferral({
  parameters,
  enabled,
  ...options
}: UseReferralProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: referralKeys.detail(parameters),
    queryFn: () => client.fetchReferral(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters != undefined,
      enabled
    ),
  })
}

type CreateReferralVariables = {
  input: CreateReferralInput,
  locale: AppLocale,
}

export function useCreateReferral(
  options: MutationHookOptions<Referral, CreateReferralVariables> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ input, locale }: CreateReferralVariables) =>
      client.createReferral(input, locale),
    onSuccess: async (...args) => {
      const [referral, { locale }] = args
      queryClient.setQueryData(
        referralKeys.detail({ id: referral.id, locale }),
        referral
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

type CancelReferralVariables = {
  referralId: string,
  locale: AppLocale,
}

export function useCancelReferral(
  options: MutationHookOptions<Referral, CancelReferralVariables> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ referralId, locale }: CancelReferralVariables) =>
      client.cancelReferral(referralId, locale),
    onSuccess: async (...args) => {
      const [referral, { locale }] = args
      queryClient.setQueryData(
        referralKeys.detail({ id: referral.id, locale }),
        referral
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

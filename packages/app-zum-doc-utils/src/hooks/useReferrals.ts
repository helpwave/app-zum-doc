import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelReferral,
  createReferral,
  fetchReferral
} from '../api/client'
import type { AppLocale, CreateReferralInput, Referral } from '../api/types'
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
  return useQuery({
    ...options,
    queryKey: referralKeys.detail(parameters),
    queryFn: () => fetchReferral(assertNotUndefined(parameters)),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ input, locale }: CreateReferralVariables) =>
      createReferral(input, locale),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ referralId, locale }: CancelReferralVariables) =>
      cancelReferral(referralId, locale),
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

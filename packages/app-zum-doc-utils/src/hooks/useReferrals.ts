import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  cancelReferral,
  createReferral,
  fetchReferral,
} from "../api/client"
import type { AppLocale, CreateReferralInput } from "../api/types"
import { homeKeys, referralKeys } from "./queryKeys"

export function useReferral(referralId: string, locale: AppLocale) {
  return useQuery({
    queryKey: referralKeys.detail(referralId, locale),
    queryFn: () => fetchReferral(referralId, locale),
    enabled: referralId.length > 0,
  })
}

export function useCreateReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      input,
      locale,
    }: {
      input: CreateReferralInput
      locale: AppLocale
    }) => createReferral(input, locale),
    onSuccess: async (referral, { locale }) => {
      queryClient.setQueryData(
        referralKeys.detail(referral.id, locale),
        referral,
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

export function useCancelReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      referralId,
      locale,
    }: {
      referralId: string
      locale: AppLocale
    }) => cancelReferral(referralId, locale),
    onSuccess: async (referral, { locale }) => {
      queryClient.setQueryData(
        referralKeys.detail(referral.id, locale),
        referral,
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

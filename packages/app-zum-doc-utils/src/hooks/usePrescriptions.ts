import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  AppLocale,
  CreatePrescriptionInput,
  Prescription
} from '../api/types'
import { getApiClient } from './apiClient'
import {
  assertNotUndefined,
  type MutationHookOptions,
  type QueryHookOptions,
  withEnabled
} from './queryHook'
import { homeKeys, prescriptionKeys } from './queryKeys'

type UsePrescriptionParameters = {
  id: string,
  locale: AppLocale,
}
type UsePrescriptionProps = QueryHookOptions<UsePrescriptionParameters, Prescription>

export function usePrescription({
  parameters,
  enabled,
  ...options
}: UsePrescriptionProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: prescriptionKeys.detail(parameters),
    queryFn: () => client.fetchPrescription(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

type CreatePrescriptionVariables = {
  input: CreatePrescriptionInput,
  locale: AppLocale,
}

export function useCreatePrescription(
  options: MutationHookOptions<Prescription, CreatePrescriptionVariables> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ input, locale }: CreatePrescriptionVariables) =>
      client.createPrescription(input, locale),
    onSuccess: async (...args) => {
      const [prescription, { locale }] = args
      queryClient.setQueryData(
        prescriptionKeys.detail({ id: prescription.id, locale }),
        prescription
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

type CancelPrescriptionVariables = {
  prescriptionId: string,
  locale: AppLocale,
}

export function useCancelPrescription(
  options: MutationHookOptions<Prescription, CancelPrescriptionVariables> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ prescriptionId, locale }: CancelPrescriptionVariables) =>
      client.cancelPrescription(prescriptionId, locale),
    onSuccess: async (...args) => {
      const [prescription, { locale }] = args
      queryClient.setQueryData(
        prescriptionKeys.detail({ id: prescription.id, locale }),
        prescription
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelPrescription,
  createPrescription,
  fetchPrescription
} from '../api/client'
import type {
  AppLocale,
  CreatePrescriptionInput,
  Prescription
} from '../api/types'
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
  return useQuery({
    ...options,
    queryKey: prescriptionKeys.detail(parameters),
    queryFn: () => fetchPrescription(assertNotUndefined(parameters)),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ input, locale }: CreatePrescriptionVariables) =>
      createPrescription(input, locale),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ prescriptionId, locale }: CancelPrescriptionVariables) =>
      cancelPrescription(prescriptionId, locale),
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Medication, MedicationCatalogItem, MedicationSize } from '../api/types'
import { getApiClient } from './apiClient'
import {
  assertNotUndefined,
  withEnabled,
  type MutationHookOptions,
  type QueryHookOptions
} from './queryHook'
import { medicationKeys } from './queryKeys'

export function usePatientMedications(
  options: QueryHookOptions<undefined, Medication[]> = {}
) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: medicationKeys.patient,
    queryFn: client.fetchPatientMedications,
  })
}

type UseMedicationSearchParameter = {
  search: string,
}
type UseMedicationSearchProps = QueryHookOptions<UseMedicationSearchParameter, MedicationCatalogItem[]>

export function useMedicationSearch({
  parameters,
  ...options
}: UseMedicationSearchProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: medicationKeys.search(parameters),
    queryFn: () => client.searchMedications(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      options.enabled
    )
  })
}

type AddPatientMedicationInput = {
  catalogId: string,
  size: MedicationSize,
}

export function useAddPatientMedication(
  options: MutationHookOptions<Medication[], AddPatientMedicationInput> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ catalogId, size }: AddPatientMedicationInput) =>
      client.addPatientMedication({ catalogId, size }),
    onSuccess: async (...args) => {
      const [medications] = args
      queryClient.setQueryData(medicationKeys.patient, medications)
      await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
      await onSuccess?.(...args)
    },
  })
}

export function useRemovePatientMedication(
  options: MutationHookOptions<Medication[], string> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (medicationId: string) => client.removePatientMedication(medicationId),
    onSuccess: async (...args) => {
      const [medications] = args
      queryClient.setQueryData(medicationKeys.patient, medications)
      await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
      await onSuccess?.(...args)
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addPatientMedication,
  fetchPatientMedications,
  removePatientMedication,
  searchMedications
} from '../api/client'
import type { Medication, MedicationCatalogItem, MedicationSize } from '../api/types'
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
  return useQuery({
    ...options,
    queryKey: medicationKeys.patient,
    queryFn: () => fetchPatientMedications(),
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
  return useQuery({
    ...options,
    queryKey: medicationKeys.search(parameters),
    queryFn: () => searchMedications(assertNotUndefined(parameters)),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ catalogId, size }: AddPatientMedicationInput) =>
      addPatientMedication({ catalogId, size }),
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
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (medicationId: string) => removePatientMedication(medicationId),
    onSuccess: async (...args) => {
      const [medications] = args
      queryClient.setQueryData(medicationKeys.patient, medications)
      await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
      await onSuccess?.(...args)
    },
  })
}

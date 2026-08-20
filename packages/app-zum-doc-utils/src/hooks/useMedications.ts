import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addPatientMedication,
  fetchPatientMedications,
  removePatientMedication,
  searchMedications,
} from "../api/client"
import type { MedicationSize } from "../api/types"
import { medicationKeys } from "./queryKeys"

export function usePatientMedications() {
  return useQuery({
    queryKey: medicationKeys.patient,
    queryFn: () => fetchPatientMedications(),
  })
}

export function useMedicationSearch(search: string, enabled = true) {
  return useQuery({
    queryKey: medicationKeys.search(search),
    queryFn: () => searchMedications({ search }),
    enabled,
  })
}

type AddPatientMedicationInput = {
  catalogId: string
  size: MedicationSize
}

export function useAddPatientMedication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ catalogId, size }: AddPatientMedicationInput) =>
      addPatientMedication({ catalogId, size }),
    onSuccess: async (medications) => {
      queryClient.setQueryData(medicationKeys.patient, medications)
      await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
    },
  })
}

export function useRemovePatientMedication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (medicationId: string) => removePatientMedication(medicationId),
    onSuccess: async (medications) => {
      queryClient.setQueryData(medicationKeys.patient, medications)
      await queryClient.invalidateQueries({ queryKey: medicationKeys.patient })
    },
  })
}

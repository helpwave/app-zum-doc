import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  cancelPrescription,
  createPrescription,
  fetchPrescription,
} from "../api/client"
import type { AppLocale, CreatePrescriptionInput } from "../api/types"
import { homeKeys, prescriptionKeys } from "./queryKeys"

type UsePrescriptionProps = {
  prescriptionId: string | null,
  locale: AppLocale,
  enabled?: boolean,
}

export function usePrescription({
  prescriptionId,
  locale,
  enabled = true,
}: UsePrescriptionProps) {
  return useQuery({
    queryKey: prescriptionKeys.detail(prescriptionId ?? '', locale),
    queryFn: () => fetchPrescription(prescriptionId as string, locale),
    enabled: enabled && prescriptionId != null && prescriptionId.length > 0,
  })
}

export function useCreatePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      input,
      locale,
    }: {
      input: CreatePrescriptionInput
      locale: AppLocale
    }) => createPrescription(input, locale),
    onSuccess: async (prescription, { locale }) => {
      queryClient.setQueryData(
        prescriptionKeys.detail(prescription.id, locale),
        prescription,
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

export function useCancelPrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      prescriptionId,
      locale,
    }: {
      prescriptionId: string
      locale: AppLocale
    }) => cancelPrescription(prescriptionId, locale),
    onSuccess: async (prescription, { locale }) => {
      queryClient.setQueryData(
        prescriptionKeys.detail(prescription.id, locale),
        prescription,
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

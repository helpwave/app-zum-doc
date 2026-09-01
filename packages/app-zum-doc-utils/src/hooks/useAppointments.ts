import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  cancelAppointment,
  createAppointment,
  fetchAppointment,
  fetchPatientProfiles
} from "../api/client"
import type { AppLocale, CreateAppointmentInput } from "../api/types"
import { appointmentKeys, homeKeys, profileListKeys } from "./queryKeys"

export function usePatientProfiles() {
  return useQuery({
    queryKey: profileListKeys.list,
    queryFn: () => fetchPatientProfiles(),
  })
}

type UseAppointmentProps = {
  appointmentId: string | null,
  locale: AppLocale,
  enabled?: boolean,
}

export function useAppointment({
  appointmentId,
  locale,
  enabled = true,
}: UseAppointmentProps) {
  return useQuery({
    queryKey: appointmentKeys.detail(appointmentId ?? '', locale),
    queryFn: () => fetchAppointment(appointmentId as string, locale),
    enabled: enabled && appointmentId != null && appointmentId.length > 0,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      input,
      locale,
    }: {
      input: CreateAppointmentInput
      locale: AppLocale
    }) => createAppointment(input, locale),
    onSuccess: async (appointment, { locale }) => {
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id, locale),
        appointment,
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appointmentId,
      locale,
    }: {
      appointmentId: string,
      locale: AppLocale,
    }) => cancelAppointment(appointmentId, locale),
    onSuccess: async (appointment, { locale }) => {
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id, locale),
        appointment,
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

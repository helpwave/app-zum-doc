import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelAppointment,
  createAppointment,
  fetchAppointment,
  fetchPatientProfiles
} from '../api/client'
import type {
  Appointment,
  AppLocale,
  CreateAppointmentInput,
  PatientProfileSummary
} from '../api/types'
import {
  type MutationHookOptions,
  type QueryHookOptions,
  withEnabled
} from './queryHook'
import { appointmentKeys, homeKeys, profileListKeys } from './queryKeys'

export function usePatientProfiles(
  options: QueryHookOptions<undefined, PatientProfileSummary[]> = {}
) {
  return useQuery({
    ...options,
    queryKey: profileListKeys.list,
    queryFn: () => fetchPatientProfiles(),
  })
}

type UseAppointmentParameters = {
  appointmentId: string,
  locale: AppLocale,
}
type UseAppointmentProps = QueryHookOptions<UseAppointmentParameters, Appointment>

export function useAppointment({
  parameters,
  enabled,
  ...options
}: UseAppointmentProps) {
  return useQuery({
    ...options,
    queryKey: appointmentKeys.detail(parameters?.appointmentId ?? '', parameters?.locale ?? ''),
    queryFn: () => {
      if(parameters === undefined)
        throw Error('parameters cannot be undefined')
      return fetchAppointment(parameters.appointmentId, parameters.locale)
    },
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

type CreateAppointmentVariables = {
  input: CreateAppointmentInput,
  locale: AppLocale,
}

export function useCreateAppointment(
  options: MutationHookOptions<Appointment, CreateAppointmentVariables> = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ input, locale }: CreateAppointmentVariables) =>
      createAppointment(input, locale),
    onSuccess: async (...args) => {
      const [appointment, { locale }] = args
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id, locale),
        appointment
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

type CancelAppointmentVariables = {
  appointmentId: string,
  locale: AppLocale,
}

export function useCancelAppointment(
  options: MutationHookOptions<Appointment, CancelAppointmentVariables> = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ appointmentId, locale }: CancelAppointmentVariables) =>
      cancelAppointment(appointmentId, locale),
    onSuccess: async (...args) => {
      const [appointment, { locale }] = args
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id, locale),
        appointment
      )
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppLocale, DoctorsOffice, MyDoctors } from '../api/types'
import { getApiClient } from './apiClient'
import {
  assertNotUndefined,
  type MutationHookOptions,
  type QueryHookOptions,
  withEnabled
} from './queryHook'
import { doctorsOfficeKeys, homeKeys, myDoctorsKeys } from './queryKeys'

type UseDoctorsOfficeParameters = {
  id: string,
  locale: AppLocale,
}
export type UseDoctorsOfficeProps = QueryHookOptions<UseDoctorsOfficeParameters, DoctorsOffice>

export function useDoctorsOffice({
  parameters,
  enabled,
  ...options
}: UseDoctorsOfficeProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: doctorsOfficeKeys.detail(parameters),
    queryFn: () => client.fetchDoctorsOffice(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      enabled
    ),
  })
}

type MyDoctorMutationInput = {
  doctorsOfficeId: string,
}

export function useAddMyDoctor(
  options: MutationHookOptions<MyDoctors, MyDoctorMutationInput> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ doctorsOfficeId }: MyDoctorMutationInput) =>
      client.addMyDoctor(doctorsOfficeId),
    onSuccess: async (...args) => {
      const [myDoctors] = args
      queryClient.setQueryData(myDoctorsKeys.all, myDoctors)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

export function useRemoveMyDoctor(
  options: MutationHookOptions<MyDoctors, MyDoctorMutationInput> = {}
) {
  const client = getApiClient()
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ doctorsOfficeId }: MyDoctorMutationInput) =>
      client.removeMyDoctor(doctorsOfficeId),
    onSuccess: async (...args) => {
      const [myDoctors] = args
      queryClient.setQueryData(myDoctorsKeys.all, myDoctors)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
      await onSuccess?.(...args)
    },
  })
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addMyDoctor, fetchDoctorsOffice, removeMyDoctor } from "../api/client"
import type { AppLocale } from "../api/types"
import { doctorsOfficeKeys, homeKeys } from "./queryKeys"

export function useDoctorsOffice(doctorsOfficeId: string, locale: AppLocale) {
  return useQuery({
    queryKey: doctorsOfficeKeys.detail(doctorsOfficeId, locale),
    queryFn: () => fetchDoctorsOffice(doctorsOfficeId, locale),
    enabled: doctorsOfficeId.length > 0,
  })
}

type DoctorsOfficeMutationInput = {
  doctorsOfficeId: string
  locale: AppLocale
}

export function useAddMyDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorsOfficeId, locale }: DoctorsOfficeMutationInput) =>
      addMyDoctor(doctorsOfficeId, locale),
    onSuccess: async (office, { locale }) => {
      queryClient.setQueryData(doctorsOfficeKeys.detail(office.id, locale), office)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

export function useRemoveMyDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorsOfficeId, locale }: DoctorsOfficeMutationInput) =>
      removeMyDoctor(doctorsOfficeId, locale),
    onSuccess: async (office, { locale }) => {
      queryClient.setQueryData(doctorsOfficeKeys.detail(office.id, locale), office)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

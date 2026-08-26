import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addMyDoctor, fetchDoctorsOffice, removeMyDoctor } from "../api/client"
import type { AppLocale } from "../api/types"
import { doctorsOfficeKeys, homeKeys, myDoctorsKeys } from "./queryKeys"

export function useDoctorsOffice(doctorsOfficeId: string, locale: AppLocale) {
  return useQuery({
    queryKey: doctorsOfficeKeys.detail(doctorsOfficeId, locale),
    queryFn: () => fetchDoctorsOffice(doctorsOfficeId, locale),
    enabled: doctorsOfficeId.length > 0,
  })
}

type MyDoctorMutationInput = {
  doctorsOfficeId: string
}

export function useAddMyDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorsOfficeId }: MyDoctorMutationInput) =>
      addMyDoctor(doctorsOfficeId),
    onSuccess: async (myDoctors) => {
      queryClient.setQueryData(myDoctorsKeys.all, myDoctors)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

export function useRemoveMyDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorsOfficeId }: MyDoctorMutationInput) =>
      removeMyDoctor(doctorsOfficeId),
    onSuccess: async (myDoctors) => {
      queryClient.setQueryData(myDoctorsKeys.all, myDoctors)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addMyDoctor, fetchDoctorsOffice, removeMyDoctor } from "../api/client"
import { doctorsOfficeKeys, homeKeys } from "./queryKeys"

export function useDoctorsOffice(doctorsOfficeId: string) {
  return useQuery({
    queryKey: doctorsOfficeKeys.detail(doctorsOfficeId),
    queryFn: () => fetchDoctorsOffice(doctorsOfficeId),
    enabled: doctorsOfficeId.length > 0,
  })
}

export function useAddMyDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (doctorsOfficeId: string) => addMyDoctor(doctorsOfficeId),
    onSuccess: async (office) => {
      queryClient.setQueryData(doctorsOfficeKeys.detail(office.id), office)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

export function useRemoveMyDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (doctorsOfficeId: string) => removeMyDoctor(doctorsOfficeId),
    onSuccess: async (office) => {
      queryClient.setQueryData(doctorsOfficeKeys.detail(office.id), office)
      await queryClient.invalidateQueries({ queryKey: homeKeys.all })
    },
  })
}

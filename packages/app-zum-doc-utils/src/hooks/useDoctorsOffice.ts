import { useQuery } from "@tanstack/react-query"
import { fetchDoctorsOffice } from "../api/client"
import { doctorsOfficeKeys } from "./queryKeys"

export function useDoctorsOffice(doctorsOfficeId: string) {
  return useQuery({
    queryKey: doctorsOfficeKeys.detail(doctorsOfficeId),
    queryFn: () => fetchDoctorsOffice(doctorsOfficeId),
    enabled: doctorsOfficeId.length > 0,
  })
}

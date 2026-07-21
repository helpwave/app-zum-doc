import { useQuery } from "@tanstack/react-query"
import { fetchPatientProfile } from "../api/client"
import { profileKeys } from "./query-keys"

export function usePatientProfile() {
  return useQuery({
    queryKey: profileKeys.patient,
    queryFn: () => fetchPatientProfile(),
  })
}

import { useQuery } from "@tanstack/react-query"
import { fetchPatientProfile, fetchPatientProfileById } from "../api/client"
import { profileKeys } from "./queryKeys"

export function usePatientProfile() {
  return useQuery({
    queryKey: profileKeys.patient,
    queryFn: () => fetchPatientProfile(),
  })
}

export function usePatientProfileById(profileId: string) {
  return useQuery({
    queryKey: profileKeys.byId(profileId),
    queryFn: () => fetchPatientProfileById(profileId),
    enabled: profileId.length > 0,
  })
}

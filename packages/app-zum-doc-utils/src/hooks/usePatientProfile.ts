import { useQuery } from "@tanstack/react-query"
import { fetchPatientProfile, fetchPatientProfileById } from "../api/client"
import { profileKeys } from "./queryKeys"

export function usePatientProfile() {
  return useQuery({
    queryKey: profileKeys.patient,
    queryFn: () => fetchPatientProfile(),
  })
}

type UsePatientProfileByIdProps = {
  profileId: string | null,
  enabled?: boolean,
}

export function usePatientProfileById({
  profileId,
  enabled = true,
}: UsePatientProfileByIdProps) {
  return useQuery({
    queryKey: profileKeys.byId(profileId ?? ''),
    queryFn: () => fetchPatientProfileById(profileId as string),
    enabled: enabled && profileId != null && profileId.length > 0,
  })
}

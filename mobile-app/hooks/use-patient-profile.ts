import { useQuery } from "@tanstack/react-query"
import { fetchPatientProfile } from "@/api/mock/client"

export function usePatientProfile() {
  return useQuery({
    queryKey: ["profile", "patient"],
    queryFn: () => fetchPatientProfile(),
  })
}

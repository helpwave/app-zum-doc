import { useQuery } from "@tanstack/react-query"
import { fetchMyDoctors } from "../api/client"
import { myDoctorsKeys } from "./queryKeys"

export function useMyDoctors() {
  return useQuery({
    queryKey: myDoctorsKeys.all,
    queryFn: () => fetchMyDoctors(),
  })
}

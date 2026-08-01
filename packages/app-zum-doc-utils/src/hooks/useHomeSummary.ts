import { useQuery } from "@tanstack/react-query"
import { fetchHomeSummary } from "../api/client"
import { homeKeys } from "./queryKeys"

export function useHomeSummary() {
  return useQuery({
    queryKey: homeKeys.summary,
    queryFn: () => fetchHomeSummary(),
  })
}

import { useQuery } from "@tanstack/react-query"
import { fetchHomeSummary } from "@/api/mock/client"

export function useHomeSummary() {
  return useQuery({
    queryKey: ["home", "summary"],
    queryFn: () => fetchHomeSummary(),
  })
}

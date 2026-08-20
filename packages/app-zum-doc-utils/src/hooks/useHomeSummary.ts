import { useQuery } from "@tanstack/react-query"
import { fetchHomeSummary } from "../api/client"
import type { AppLocale } from "../api/types"
import { homeKeys } from "./queryKeys"

export function useHomeSummary(locale: AppLocale) {
  return useQuery({
    queryKey: homeKeys.summary(locale),
    queryFn: () => fetchHomeSummary(locale),
  })
}

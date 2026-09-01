import { useQuery } from "@tanstack/react-query"
import { fetchHomeSummary } from "../api/client"
import type { AppLocale } from "../api/types"
import { homeKeys } from "./queryKeys"

type UseHomeSummaryProps = {
  locale: AppLocale,
  enabled?: boolean,
}

export function useHomeSummary({ locale, enabled = true }: UseHomeSummaryProps) {
  return useQuery({
    queryKey: homeKeys.summary(locale),
    queryFn: () => fetchHomeSummary(locale),
    enabled,
  })
}

import { useQuery } from '@tanstack/react-query'
import { fetchHomeSummary } from '../api/client'
import type { AppLocale } from '../api/types'
import { assertNotUndefined, withEnabled, type QueryHookOptions } from './queryHook'
import { homeKeys } from './queryKeys'

type HomeSummary = Awaited<ReturnType<typeof fetchHomeSummary>>

type UseHomeSummaryParameters = {
  locale: AppLocale,
}
type UseHomeSummaryProps = QueryHookOptions<UseHomeSummaryParameters, HomeSummary>

export function useHomeSummary({
  parameters,
  ...options
}: UseHomeSummaryProps) {
  return useQuery({
    ...options,
    queryKey: homeKeys.summary(parameters),
    queryFn: () => fetchHomeSummary(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      options.enabled
    )
  })
}

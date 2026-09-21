import { useQuery } from '@tanstack/react-query'
import type { AppLocale, HomeSummary } from '../api/types'
import { getApiClient } from './apiClient'
import { assertNotUndefined, withEnabled, type QueryHookOptions } from './queryHook'
import { homeKeys } from './queryKeys'

type UseHomeSummaryParameters = {
  locale: AppLocale,
}
type UseHomeSummaryProps = QueryHookOptions<UseHomeSummaryParameters, HomeSummary>

export function useHomeSummary({
  parameters,
  ...options
}: UseHomeSummaryProps) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: homeKeys.summary(parameters),
    queryFn: () => client.fetchHomeSummary(assertNotUndefined(parameters)),
    enabled: withEnabled(
      parameters !== undefined,
      options.enabled
    )
  })
}

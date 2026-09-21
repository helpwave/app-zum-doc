import { useQuery } from '@tanstack/react-query'
import type { MyDoctors } from '../api/types'
import { getApiClient } from './apiClient'
import type { QueryHookOptions } from './queryHook'
import { myDoctorsKeys } from './queryKeys'

export function useMyDoctors(options: QueryHookOptions<undefined, MyDoctors> = {}) {
  const client = getApiClient()
  return useQuery({
    ...options,
    queryKey: myDoctorsKeys.all,
    queryFn: client.fetchMyDoctors,
  })
}

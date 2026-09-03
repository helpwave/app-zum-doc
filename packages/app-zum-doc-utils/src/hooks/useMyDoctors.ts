import { useQuery } from '@tanstack/react-query'
import { fetchMyDoctors } from '../api/client'
import type { MyDoctors } from '../api/types'
import type { QueryHookOptions } from './queryHook'
import { myDoctorsKeys } from './queryKeys'

export function useMyDoctors(options: QueryHookOptions<undefined, MyDoctors> = {}) {
  return useQuery({
    ...options,
    queryKey: myDoctorsKeys.all,
    queryFn: () => fetchMyDoctors(),
  })
}

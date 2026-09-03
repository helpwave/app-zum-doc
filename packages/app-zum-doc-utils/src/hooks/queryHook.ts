import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

export type QueryHookOptions<TParameters, TData> = {
  parameters?: TParameters,
} & Omit<
  UseQueryOptions<TData, Error, TData>,
  'queryKey' | 'queryFn'
>

export type MutationHookOptions<TData, TVariables, TOnMutateResult = unknown> = Omit<
  UseMutationOptions<TData, Error, TVariables, TOnMutateResult>,
  'mutationFn'
>

export const assertNotUndefined = <T>(value?: T): T => {
  if(value === undefined)
    throw Error('parameters cannot be undefined')
  return value
}

export function withEnabled<TEnabled>(
  required: boolean,
  enabled: TEnabled | undefined
): TEnabled | false | undefined {
  if (!required) {
    return false
  }
  return enabled
}

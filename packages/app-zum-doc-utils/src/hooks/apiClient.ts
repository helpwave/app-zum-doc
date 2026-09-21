import type { ApiClient } from '../api/client'
import { createMockApiClient } from '../api/mock/client'

let apiClient: ApiClient | undefined

export function getApiClient(): ApiClient {
  apiClient ??= createMockApiClient()
  return apiClient
}

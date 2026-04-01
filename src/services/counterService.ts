import apiClient from './apiClient'
import type { CounterResponse } from '../types/counter'

export function getEntityCounter(entityType: string, entityId: string, metrics?: string[]) {
  return apiClient.get<CounterResponse>(`/api/v1/counter/${entityType}/${entityId}`, {
    params: {
      metrics: metrics?.length ? metrics.join(',') : undefined,
    },
  })
}

import apiClient from './apiClient'
import type { ActionResponse } from '../types/knowpost'

const PREFIX = '/api/v1/action'

function createActionPayload(entityId: string) {
  return {
    entityType: 'knowpost',
    entityId,
  }
}

export function likeKnowpost(entityId: string) {
  return apiClient.post<ActionResponse>(`${PREFIX}/like`, createActionPayload(entityId))
}

export function unlikeKnowpost(entityId: string) {
  return apiClient.post<ActionResponse>(`${PREFIX}/unlike`, createActionPayload(entityId))
}

export function favKnowpost(entityId: string) {
  return apiClient.post<ActionResponse>(`${PREFIX}/fav`, createActionPayload(entityId))
}

export function unfavKnowpost(entityId: string) {
  return apiClient.post<ActionResponse>(`${PREFIX}/unfav`, createActionPayload(entityId))
}

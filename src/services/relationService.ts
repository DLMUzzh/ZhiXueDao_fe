import apiClient from './apiClient'
import type { RelationStatusResponse } from '../types/relation'

const PREFIX = '/api/v1/relation'

export function followUser(toUserId: string) {
  return apiClient.post<boolean>(`${PREFIX}/follow`, null, {
    params: { toUserId },
  })
}

export function unfollowUser(toUserId: string) {
  return apiClient.post<boolean>(`${PREFIX}/unfollow`, null, {
    params: { toUserId },
  })
}

export function getRelationStatus(toUserId: string) {
  return apiClient.get<RelationStatusResponse>(`${PREFIX}/status`, {
    params: { toUserId },
  })
}

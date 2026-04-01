import apiClient from './apiClient'
import type { FeedResponse, ActionResponse } from '../types/knowpost'

const FEED_PREFIX = '/api/v1/knowposts'
const ACTION_PREFIX = '/api/v1/action'

/** 获取首页 Feed 列表 */
export function getFeed(page = 1, size = 20) {
  return apiClient.get<FeedResponse>(`${FEED_PREFIX}/feed`, {
    params: { page, size },
  })
}

/** 点赞 */
export function likePost(entityId: string) {
  return apiClient.post<ActionResponse>(`${ACTION_PREFIX}/like`, {
    entityType: 'knowpost',
    entityId,
  })
}

/** 取消点赞 */
export function unlikePost(entityId: string) {
  return apiClient.post<ActionResponse>(`${ACTION_PREFIX}/unlike`, {
    entityType: 'knowpost',
    entityId,
  })
}

/** 收藏 */
export function favPost(entityId: string) {
  return apiClient.post<ActionResponse>(`${ACTION_PREFIX}/fav`, {
    entityType: 'knowpost',
    entityId,
  })
}

/** 取消收藏 */
export function unfavPost(entityId: string) {
  return apiClient.post<ActionResponse>(`${ACTION_PREFIX}/unfav`, {
    entityType: 'knowpost',
    entityId,
  })
}

import apiClient from './apiClient'
import type { SearchResponse, SuggestResponse } from '../types/search'

const PREFIX = '/api/v1/search'

export function searchKnowposts(params: {
  q: string
  size?: number
  tags?: string[]
  after?: string
}) {
  return apiClient.get<SearchResponse>(PREFIX, {
    params: {
      q: params.q,
      size: params.size ?? 20,
      tags: params.tags?.length ? params.tags.join(',') : undefined,
      after: params.after,
    },
  })
}

export function getSearchSuggestions(prefix: string, size = 5) {
  return apiClient.get<SuggestResponse>(`${PREFIX}/suggest`, {
    params: { prefix, size },
  })
}

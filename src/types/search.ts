import type { FeedItem } from './knowpost'

export interface SearchResponse {
  items: FeedItem[]
  nextAfter?: string | null
  hasMore: boolean
}

export interface SuggestResponse {
  items: string[]
}

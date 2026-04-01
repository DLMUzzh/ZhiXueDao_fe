import type { ViewHistoryItem } from '../types/knowpost'

const SEARCH_HISTORY_KEY = 'zhiguang_search_history'
const VIEW_HISTORY_KEY = 'zhiguang_view_history'
const HISTORY_LIMIT = 10

export function readSearchHistory() {
  return readStringList(SEARCH_HISTORY_KEY)
}

export function pushSearchHistory(keyword: string) {
  const normalized = keyword.trim()
  if (!normalized) return

  const history = readStringList(SEARCH_HISTORY_KEY)
    .filter((item) => item !== normalized)
    .slice(0, HISTORY_LIMIT - 1)

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([normalized, ...history]))
}

export function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY)
}

export function readViewHistory() {
  try {
    const raw = localStorage.getItem(VIEW_HISTORY_KEY)
    if (!raw) return [] as ViewHistoryItem[]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ViewHistoryItem[]) : []
  } catch {
    return [] as ViewHistoryItem[]
  }
}

export function pushViewHistory(item: ViewHistoryItem) {
  const history = readViewHistory().filter((entry) => entry.id !== item.id).slice(0, HISTORY_LIMIT - 1)
  localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify([item, ...history]))
}

function readStringList(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return [] as string[]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return [] as string[]
  }
}

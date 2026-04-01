import { sanitizeHighlightHtml } from './markdown'

export function highlightKeyword(text: string, keyword: string) {
  if (!keyword.trim()) {
    return escapeHtml(text)
  }

  const escaped = escapeHtml(text)
  const pattern = new RegExp(escapeRegExp(keyword.trim()), 'gi')
  return escaped.replace(pattern, (match) => `<em>${match}</em>`)
}

export function normalizeHighlightHtml(text: string | undefined, keyword: string) {
  if (!text) return ''

  if (text.includes('<em>')) {
    return sanitizeHighlightHtml(text)
  }

  return sanitizeHighlightHtml(highlightKeyword(text, keyword))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

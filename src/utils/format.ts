export function formatCount(value: number) {
  if (value >= 10000) {
    return `${trimTrailingZero((value / 10000).toFixed(value >= 100000 ? 0 : 1))}万`
  }

  if (value >= 1000) {
    return `${trimTrailingZero((value / 1000).toFixed(value >= 10000 ? 0 : 1))}k`
  }

  return String(value)
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function trimTrailingZero(value: string) {
  return value.replace(/\.0$/, '')
}

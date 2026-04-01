import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export function useToast() {
  function show(type: ToastType, message: string, duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id: number) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return {
    toasts,
    success: (msg: string) => show('success', msg),
    error: (msg: string) => show('error', msg),
    warning: (msg: string) => show('warning', msg),
    info: (msg: string) => show('info', msg),
    remove,
  }
}

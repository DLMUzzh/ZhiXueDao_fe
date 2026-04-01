import axios from 'axios'
import type { ApiError } from '../types/auth'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/* ---------- 请求拦截器：自动注入 token ---------- */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('xuezhidao_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ---------- 响应拦截器：统一处理错误 ---------- */
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const data = {
        ...(error.response.data as Partial<ApiError>),
        status: error.response.status,
      } as ApiError

      if (error.response.status === 401) {
        localStorage.removeItem('xuezhidao_access_token')
        localStorage.removeItem('xuezhidao_refresh_token')
        localStorage.removeItem('xuezhidao_current_user')
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?redirect=${redirect}`
      }
      return Promise.reject(data)
    }
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: '网络异常，请检查网络连接',
      status: 0,
    } as ApiError)
  },
)

export default apiClient

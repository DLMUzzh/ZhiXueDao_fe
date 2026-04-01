import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '../types/auth'
import * as authService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  /* ---------- State ---------- */
  const accessToken = ref<string | null>(localStorage.getItem('xuezhidao_access_token'))
  const refreshTokenVal = ref<string | null>(localStorage.getItem('xuezhidao_refresh_token'))
  const user = ref<AuthUser | null>(
    JSON.parse(localStorage.getItem('xuezhidao_current_user') || 'null'),
  )

  /* ---------- Getters ---------- */
  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  /* ---------- Actions ---------- */

  /** 保存登录凭证 */
  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshTokenVal.value = refresh
    localStorage.setItem('xuezhidao_access_token', access)
    localStorage.setItem('xuezhidao_refresh_token', refresh)
  }

  /** 保存用户信息 */
  function setUser(u: AuthUser) {
    user.value = u
    localStorage.setItem('xuezhidao_current_user', JSON.stringify(u))
  }

  /** 拉取当前用户信息 */
  async function fetchUser() {
    try {
      const { data } = await authService.getMe()
      setUser(data)
    } catch {
      clearAuth()
    }
  }

  /** 清除认证信息 */
  function clearAuth() {
    accessToken.value = null
    refreshTokenVal.value = null
    user.value = null
    localStorage.removeItem('xuezhidao_access_token')
    localStorage.removeItem('xuezhidao_refresh_token')
    localStorage.removeItem('xuezhidao_current_user')
  }

  /** 登出 */
  async function logoutAction() {
    try {
      if (refreshTokenVal.value) {
        await authService.logout(refreshTokenVal.value)
      }
    } finally {
      clearAuth()
    }
  }

  return {
    accessToken,
    refreshTokenVal,
    user,
    isLoggedIn,
    setTokens,
    setUser,
    fetchUser,
    clearAuth,
    logoutAction,
  }
})

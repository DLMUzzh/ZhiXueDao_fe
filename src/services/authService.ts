import apiClient from './apiClient'
import type {
  SendCodeRequest,
  SendCodeResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  PasswordResetRequest,
  RefreshTokenRequest,
  AuthUser,
} from '../types/auth'

const PREFIX = '/api/v1/auth'

/** 发送验证码 */
export function sendCode(data: SendCodeRequest) {
  return apiClient.post<SendCodeResponse>(`${PREFIX}/send-code`, data)
}

/** 登录 */
export function login(data: LoginRequest) {
  return apiClient.post<LoginResponse>(`${PREFIX}/login`, data)
}

/** 注册 */
export function register(data: RegisterRequest) {
  return apiClient.post<RegisterResponse>(`${PREFIX}/register`, data)
}

/** 重置密码 */
export function resetPassword(data: PasswordResetRequest) {
  return apiClient.post<void>(`${PREFIX}/password/reset`, data)
}

/** 刷新 token */
export function refreshToken(data: RefreshTokenRequest) {
  return apiClient.post<LoginResponse>(`${PREFIX}/token/refresh`, data)
}

/** 获取当前用户 */
export function getMe() {
  return apiClient.get<AuthUser>(`${PREFIX}/me`)
}

/** 登出 */
export function logout(refreshToken: string) {
  return apiClient.post<void>(`${PREFIX}/logout`, { refreshToken })
}

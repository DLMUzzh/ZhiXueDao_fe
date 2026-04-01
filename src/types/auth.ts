export type VerificationScene = 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD'
export type IdentifierType = 'PHONE' | 'EMAIL' | 'USERNAME'

export interface SendCodeRequest {
  scene: VerificationScene
  identifierType: IdentifierType
  identifier: string
}

export interface LoginRequest {
  identifierType: IdentifierType
  identifier: string
  code?: string
  password?: string
}

export interface RegisterRequest {
  identifierType: IdentifierType
  identifier: string
  code: string
  password: string
  nickname: string
}

export interface PasswordResetRequest {
  identifierType: IdentifierType
  identifier: string
  code: string
  newPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface SendCodeResponse {
  identifier: string
  scene: string
  expireSeconds: number
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface RegisterResponse {
  id: number
  username: string
  nickname: string
  createdAt: string
}

export interface AuthUser {
  id: number
  username?: string
  nickname: string
  avatar?: string
  roles?: string[]
  createdAt?: string
  phone?: string
  email?: string
  bio?: string
  gender?: string
  birthday?: string
  school?: string
  tagJson?: string
}

export interface ApiError {
  code: string
  message: string
  path?: string
  timestamp?: string
  status?: number
}

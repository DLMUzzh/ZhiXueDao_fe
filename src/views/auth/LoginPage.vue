<template>
  <AuthLayout>
    <!-- 标题 -->
    <h1 class="auth-title">欢迎回来</h1>
    <p class="auth-subtitle">登录你的学知岛账号</p>

    <!-- 错误 Banner -->
    <AlertBanner :visible="!!errorMsg" type="error" @close="errorMsg = ''">
      {{ errorMsg }}
    </AlertBanner>

    <form class="auth-form" @submit.prevent="handleLogin">
      <!-- 手机号 -->
      <FormInput
        v-model="phone"
        type="tel"
        placeholder="请输入手机号"
        :error-msg="phoneError"
        :disabled="isSubmitting"
        @blur="validatePhone"
      >
        <template #leftIcon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </template>
      </FormInput>

      <!-- 验证码 -->
      <div class="form-gap">
        <CodeInput
          v-model="code"
          :btn-disabled="!isPhoneValid"
          :is-counting="countdown.isCounting.value"
          :remaining="countdown.remaining.value"
          :is-sending="isSendingCode"
          :disabled="isSubmitting"
          @send="handleSendCode"
          @enter="handleLogin"
        />
      </div>

      <!-- 登录按钮 -->
      <div class="form-gap-lg">
        <PrimaryButton
          text="登 录"
          loading-text="登录中…"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          @click="handleLogin"
        />
      </div>
    </form>

    <!-- 底部链接 -->
    <div class="auth-links">
      <p class="auth-links__item">
        还没有账号？
        <RouterLink :to="registerLink" class="auth-link">立即注册</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import AuthLayout from '../../components/auth/AuthLayout.vue'
import FormInput from '../../components/auth/FormInput.vue'
import CodeInput from '../../components/auth/CodeInput.vue'
import PrimaryButton from '../../components/auth/PrimaryButton.vue'
import AlertBanner from '../../components/auth/AlertBanner.vue'
import { useAuthStore } from '../../stores/auth'
import { useCountdown } from '../../composables/useCountdown'
import { useToast } from '../../composables/useToast'
import * as authService from '../../services/authService'
import type { ApiError } from '../../types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const countdown = useCountdown(60)
const toast = useToast()

/* ---------- 表单状态 ---------- */
const phone = ref('')
const code = ref('')
const phoneError = ref('')
const errorMsg = ref('')
const isSendingCode = ref(false)
const isSubmitting = ref(false)

/* ---------- 校验 ---------- */
const PHONE_REG = /^1[3-9]\d{9}$/
const isPhoneValid = computed(() => PHONE_REG.test(phone.value))
const canSubmit = computed(() => isPhoneValid.value && code.value.length >= 1)

function validatePhone() {
  if (phone.value && !isPhoneValid.value) {
    phoneError.value = '请输入正确的手机号'
  } else {
    phoneError.value = ''
  }
}

/* ---------- 已登录跳转 ---------- */
const redirect = computed(() => (route.query.redirect as string) || '/')
const registerLink = computed(() => {
  const r = route.query.redirect
  return r ? `/register?redirect=${encodeURIComponent(r as string)}` : '/register'
})

onMounted(() => {
  if (authStore.isLoggedIn) {
    router.replace(redirect.value)
  }
})

/* ---------- 发送验证码 ---------- */
async function handleSendCode() {
  validatePhone()
  if (!isPhoneValid.value) return

  isSendingCode.value = true
  try {
    await authService.sendCode({
      scene: 'LOGIN',
      identifierType: 'PHONE',
      identifier: phone.value,
    })
    toast.success('验证码已发送')
    countdown.start()
  } catch (err) {
    const apiErr = err as ApiError
    toast.error(apiErr.message || '发送失败，请稍后重试')
  } finally {
    isSendingCode.value = false
  }
}

/* ---------- 提交登录 ---------- */
async function handleLogin() {
  if (!canSubmit.value || isSubmitting.value) return

  errorMsg.value = ''
  isSubmitting.value = true
  try {
    const { data } = await authService.login({
      identifierType: 'PHONE',
      identifier: phone.value,
      code: code.value,
    })

    // 存储凭证
    authStore.setTokens(data.accessToken, data.refreshToken)

    // 拉取用户信息
    await authStore.fetchUser()

    // 跳转
    setTimeout(() => {
      router.replace(redirect.value)
    }, 300)
  } catch (err) {
    const apiErr = err as ApiError
    errorMsg.value = apiErr.message || '验证码错误或已过期'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 15px;
  color: var(--gray-500);
  margin-bottom: 36px;
}

.auth-form {
  width: 100%;
}

.form-gap {
  margin-top: 20px;
}

.form-gap-lg {
  margin-top: 32px;
}

.auth-links {
  margin-top: 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-links__item {
  font-size: 14px;
  color: var(--gray-500);
}

.auth-link {
  color: var(--primary-500);
  font-weight: 500;
  text-decoration: none;
  transition: color 150ms ease;
}

.auth-link:hover {
  color: var(--primary-600);
  text-decoration: underline;
}

</style>
